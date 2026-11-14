from typing import List, Literal, Optional

from pydantic import BaseModel, Field


# POST /pdf/load  -> load a PDF from the user's study materials
class LoadPdfRequest(BaseModel):
    file_url: str
    title: Optional[str] = None


# One earlier message in the conversation
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


# POST /chat/ask
class AskRequest(BaseModel):
    document_id: str
    question: str = Field(min_length=1, max_length=2000)
    history: List[ChatMessage] = []
