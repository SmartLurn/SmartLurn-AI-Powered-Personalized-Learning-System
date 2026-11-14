
from urllib.parse import urlparse

import pymupdf
import httpx
from fastapi import UploadFile, HTTPException


MAX_PDF_BYTES = 10 * 1024 * 1024  # 10 MB, same limit as the backend upload

# Only download PDFs from Cloudinary, where study materials are stored.
# The backend gives signed links on api.cloudinary.com (see getPdfViewUrl).
ALLOWED_PDF_HOSTS = {"api.cloudinary.com", "res.cloudinary.com"}


def extract_pages(contents: bytes):
    """Read the text of every page from PDF bytes."""
    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty"
        )

    try:
        document = pymupdf.open(
            stream=contents,
            filetype="pdf"
        )

        pages = []

        for page_number, page in enumerate(document, start=1):
            text = page.get_text("text")

            if text.strip():
                pages.append({
                    "page_number": page_number,
                    "text": text
                })

        document.close()

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not process this PDF"
        )

    if not pages:
        raise HTTPException(
            status_code=400,
            detail="No readable text found in PDF"
        )

    return {
        "total_pages": len(pages),
        "pages": pages
    }


async def extract_pdf_text(file: UploadFile):
    # Read uploaded PDF into memory
    contents = await file.read()

    if len(contents) > MAX_PDF_BYTES:
        raise HTTPException(
            status_code=400,
            detail="The PDF must be smaller than 10 MB"
        )

    return extract_pages(contents)


async def extract_pdf_text_from_url(file_url: str):
    # Check the link points to Cloudinary before downloading anything
    parsed = urlparse(file_url)

    if parsed.scheme != "https" or parsed.hostname not in ALLOWED_PDF_HOSTS:
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF link"
        )

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=False) as client:
            response = await client.get(file_url)
    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Could not download the PDF"
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail="Could not download the PDF"
        )

    if len(response.content) > MAX_PDF_BYTES:
        raise HTTPException(
            status_code=400,
            detail="The PDF must be smaller than 10 MB"
        )

    return extract_pages(response.content)
