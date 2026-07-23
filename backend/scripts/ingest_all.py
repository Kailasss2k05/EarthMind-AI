import sys
from pathlib import Path

# Add backend root to sys.path so we can import 'app'
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.rag.config import DOMAINS, RAW_DATA_DIR
from app.rag.vector_store import is_pdf_indexed
from app.rag.ingest import ingest_uploaded_pdf

def main():
    print("=" * 60)
    print("Bulk PDF Ingestion Utility")
    print("=" * 60)

    total_discovered = 0
    total_indexed_already = 0
    total_newly_indexed = 0
    total_failed = 0
    domains_processed = 0

    for domain in DOMAINS:
        domain_dir = RAW_DATA_DIR / domain
        if not domain_dir.exists() or not domain_dir.is_dir():
            continue

        domains_processed += 1
        pdfs = list(domain_dir.rglob("*.pdf"))
        if not pdfs:
            continue

        print(f"\n{'-'*48}")
        print(f"Domain: {domain.capitalize()}")
        print(f"{'-'*48}\n")

        for pdf_path in pdfs:
            filename = pdf_path.name
            total_discovered += 1
            
            try:
                if is_pdf_indexed(domain, filename):
                    print(f"[SKIP] {filename}")
                    total_indexed_already += 1
                    continue
                
                print(f"[INDEX] {filename}")
                ingest_uploaded_pdf(domain, pdf_path)
                print("✓ Indexed successfully\n")
                total_newly_indexed += 1

            except Exception as e:
                print(f"✗ Failed to index {filename}")
                print(f"  Error: {e}\n")
                total_failed += 1

    print("\n" + "=" * 40)
    print("Bulk Ingestion Complete")
    print("")
    print(f"Domains processed:      {domains_processed}")
    print(f"Total PDFs discovered:  {total_discovered}")
    print(f"Already indexed:        {total_indexed_already}")
    print(f"Newly indexed:          {total_newly_indexed}")
    print(f"Failed:                 {total_failed}")
    print("=" * 40)

if __name__ == "__main__":
    main()
