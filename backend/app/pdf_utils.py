import io

from pypdf import PdfReader


def pdf_to_text(data: bytes) -> str:
    """Extract clean text from PDF bytes."""
    reader = PdfReader(io.BytesIO(data))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    lines = (line.strip() for line in text.splitlines())
    return "\n".join(line for line in lines if line)
