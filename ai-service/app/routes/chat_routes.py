
from fastapi import APIRouter, HTTPException

from app.schemas.pdf_schema import AskRequest
from app.services.document_store import get_document
from app.services.qa_service import answer_question

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.get("/health")
def chat_health():
    return {
        "message": "Chat service is ready"
    }


# Ask a question about a loaded PDF
@router.post("/ask")
async def ask_question(body: AskRequest):

    document = get_document(body.document_id)

    # The AI service was restarted or the PDF was removed from memory
    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found. Please load the PDF again."
        )

    question = body.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please type a question"
        )

    answer = await answer_question(document, question, body.history)

    return {
        "answer": answer
    }
