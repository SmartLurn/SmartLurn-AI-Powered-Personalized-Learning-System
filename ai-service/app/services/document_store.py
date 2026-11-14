import uuid
from collections import OrderedDict


# Extracted PDF text kept in memory, keyed by a random document id.
# It is cleared when the AI service restarts; the frontend then loads the PDF again.
MAX_DOCUMENTS = 50

_documents = OrderedDict()


def save_document(title: str, pages: list) -> str:
    document_id = str(uuid.uuid4())

    _documents[document_id] = {
        "title": title,
        "pages": pages,
    }

    # Forget the oldest PDF when the store is full
    if len(_documents) > MAX_DOCUMENTS:
        _documents.popitem(last=False)

    return document_id


def get_document(document_id: str):
    return _documents.get(document_id)
