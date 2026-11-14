from fastapi import APIRouter, UploadFile, File, HTTPException

from app.schemas.pdf_schema import LoadPdfRequest
from app.services.pdf_service import extract_pdf_text, extract_pdf_text_from_url
from app.services.document_store import save_document

router = APIRouter(
    prefix="/pdf",
    tags=["PDF"]
)


@router.get("/health")
def pdf_health():
    return {
        "message": "PDF service is ready"
    }


# Upload a PDF directly from the computer
@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    extracted_data = await extract_pdf_text(file)

    document_id = save_document(file.filename, extracted_data["pages"])

    return {
        "document_id": document_id,
        "title": file.filename,
        "total_pages": extracted_data["total_pages"]
    }


# Load a PDF from the user's study materials (stored on Cloudinary)
@router.post("/load")
async def load_pdf(body: LoadPdfRequest):

    extracted_data = await extract_pdf_text_from_url(body.file_url)

    title = body.title or "Study material"
    document_id = save_document(title, extracted_data["pages"])

    return {
        "document_id": document_id,
        "title": title,
        "total_pages": extracted_data["total_pages"]
    }
