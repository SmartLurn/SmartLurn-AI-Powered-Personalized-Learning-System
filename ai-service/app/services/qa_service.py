import asyncio

from fastapi import HTTPException
from google import genai
from google.genai import errors, types

from app.config.settings import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODELS

# Errors that usually go away if we wait a moment (rate limit, overloaded, timeout)
RETRY_CODES = {429, 500, 503, 504}
# Errors that mean "this model can't be used", so we move to the next model
SKIP_MODEL_CODES = {404}
ATTEMPTS_PER_MODEL = 2


# About 100k tokens of PDF text per question
MAX_CONTEXT_CHARS = 400_000

# How many earlier messages to send so follow-up questions make sense
MAX_HISTORY_MESSAGES = 6

SYSTEM_INSTRUCTION = """You are SmartLurn's AI study assistant.
Answer the student's question using ONLY the study material provided.

How to answer:
- By default, read the relevant parts of the material, understand them, and explain them
  in your own simple, clear words, like a good tutor would. Do not just copy the text.
- If the student asks for the original/exact/actual definition, wording, text, statement or
  a quote (for example "give the definition from the PDF", "exact words", "as written",
  "quote it"), give the text EXACTLY as it appears in the material, word for word.
  Do not paraphrase, shorten, fix grammar or add words inside the quote.
  Put each quoted passage on its own line starting with "> " and add the page number after it,
  like: > A primary key uniquely identifies each row in a table. (p. 3)
  You may add a short simple explanation after the quote if it helps.
- If the exact wording is not in the material, say so clearly. Never invent a quote.

Always:
- Mention the page numbers you used, like (p. 3) or (pp. 4-5).
- If the material does not contain the answer, say so clearly instead of guessing.
- Use short paragraphs or bullet points when it helps."""

_client = None


def get_client():
    global _client

    # Missing, or still the placeholder from the example .env
    if not GEMINI_API_KEY or GEMINI_API_KEY.lower().startswith("your"):
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set. Add your key to ai-service/.env and restart the AI service."
        )

    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)

    return _client


async def generate_with_fallback(client, contents):
    """Ask the main model; on temporary errors retry, and if a model is
    retired or keeps failing, try the next model in GEMINI_FALLBACK_MODELS."""
    models = list(dict.fromkeys([GEMINI_MODEL, *GEMINI_FALLBACK_MODELS]))  # no duplicates

    for model in models:
        for attempt in range(1, ATTEMPTS_PER_MODEL + 1):
            try:
                return await client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(temperature=0.3),
                )

            except errors.APIError as error:
                print(f"Gemini error ({model}, attempt {attempt}):", error.code, error.status)

                if "API_KEY_INVALID" in str(error) or "API key not valid" in str(error):
                    raise HTTPException(
                        status_code=500,
                        detail="The Gemini API key is invalid. Check GEMINI_API_KEY in ai-service/.env."
                    )

                if error.code in SKIP_MODEL_CODES:
                    break  # model retired or renamed: try the next one

                if error.code in RETRY_CODES and attempt < ATTEMPTS_PER_MODEL:
                    await asyncio.sleep(attempt * 2)  # wait 2s, then try again
                    continue

                if error.code in RETRY_CODES:
                    break  # still failing: try the next model

                # Any other error (bad request etc.) won't be fixed by another model
                raise HTTPException(
                    status_code=502,
                    detail="The AI could not answer this question. Please try rephrasing it."
                )

            except Exception as error:
                print(f"Gemini error ({model}):", error)
                break

    raise HTTPException(
        status_code=503,
        detail="The AI is busy right now. Please try again in a minute."
    )


def build_context(pages: list) -> str:
    """Join the pages into one text block with page markers."""
    parts = []
    total_chars = 0

    for page in pages:
        part = f"--- Page {page['page_number']} ---\n{page['text'].strip()}\n"

        if total_chars + len(part) > MAX_CONTEXT_CHARS:
            parts.append("--- The rest of the document was cut off because it is too long ---")
            break

        parts.append(part)
        total_chars += len(part)

    return "\n".join(parts)


async def answer_question(document: dict, question: str, history: list) -> str:
    client = get_client()

    context = build_context(document["pages"])

    # The instructions and PDF go first, then the recent conversation, then the new question.
    # (The instructions are sent as a message because the Gemini v1 API rejects system_instruction.)
    contents = [
        types.Content(
            role="user",
            parts=[types.Part(
                text=f'{SYSTEM_INSTRUCTION}\n\nStudy material: "{document["title"]}"\n\n{context}'
            )],
        ),
        types.Content(
            role="model",
            parts=[types.Part(text="I have read the material. What would you like to know?")],
        ),
    ]

    for message in history[-MAX_HISTORY_MESSAGES:]:
        contents.append(
            types.Content(
                role="model" if message.role == "assistant" else "user",
                parts=[types.Part(text=message.content)],
            )
        )

    contents.append(
        types.Content(role="user", parts=[types.Part(text=question)])
    )

    response = await generate_with_fallback(client, contents)

    answer = (response.text or "").strip()

    if not answer:
        raise HTTPException(
            status_code=502,
            detail="The AI returned an empty answer. Please rephrase your question."
        )

    return answer
