"""
pdf_loader.py
-------------
Step 1 of the pipeline: turn PDF files sitting on disk into plain text
that Python can work with.

If you're new to this: a PDF is just a container. Inside it there's
text, but it's stored in a special format for printing/viewing nicely,
not for easy reading by code. `pypdf` knows how to open that container
and pull the text back out for us, page by page.
"""

from pathlib import Path
from pypdf import PdfReader


def load_pdf_text(pdf_path: Path) -> list[dict]:
    """
    Read a single PDF and return its text, split by page.

    Returns a list like:
        [
          {"page": 1, "text": "..."},
          {"page": 2, "text": "..."},
          ...
        ]
    We keep the page number because it's useful later for citations
    (e.g. "SDG Goal 7 report, page 12").
    """
    reader = PdfReader(str(pdf_path))
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = text.strip()
        if text:  # skip blank pages (scanned images with no text layer, etc.)
            pages.append({"page": i, "text": text})
    return pages


def load_all_pdfs_in_folder(folder: Path) -> list[dict]:
    """
    Read every PDF in a folder (e.g. data/raw/sdg/) and return one flat
    list of page-level records, each tagged with which file it came from.

    Returns:
        [
          {"source": "sdg_report.pdf", "page": 1, "text": "..."},
          ...
        ]
    """
    records = []
    pdf_files = sorted(folder.glob("*.pdf"))

    if not pdf_files:
        print(f"  (no PDFs found in {folder})")
        return records

    for pdf_path in pdf_files:
        try:
            pages = load_pdf_text(pdf_path)
            for p in pages:
                records.append({
                    "source": pdf_path.name,
                    "page": p["page"],
                    "text": p["text"],
                })
            print(f"  read {pdf_path.name}: {len(pages)} pages with text")
        except Exception as e:
            # Don't let one broken/corrupt PDF stop the whole pipeline
            print(f"  !! could not read {pdf_path.name}: {e}")

    return records
