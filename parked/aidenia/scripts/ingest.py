"""
Ingestion PDF → Pinecone pour Aidénia.
Usage : python scripts/ingest.py --file cgv.pdf --source "CGV FlowDiff"
Prérequis : pip install pdfplumber openai pinecone-client python-dotenv
"""

import argparse
import os
import uuid
from pathlib import Path

import pdfplumber
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

CHUNK_SIZE = 500       # mots par chunk
CHUNK_OVERLAP = 50     # mots de chevauchement
EMBED_MODEL = "text-embedding-3-small"
EMBED_DIM = 1536
BATCH_SIZE = 100       # upserts Pinecone par lot


def extract_text_from_pdf(path: str) -> list[dict]:
    """Extrait le texte page par page depuis un PDF."""
    pages = []
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"page": i, "text": text})
    return pages


def chunk_text(text: str, source: str, page: int) -> list[dict]:
    """Découpe un texte en chunks avec chevauchement."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunk_words = words[start:end]
        chunks.append({
            "id": str(uuid.uuid4()),
            "text": " ".join(chunk_words),
            "source": source,
            "page": page,
        })
        if end == len(words):
            break
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def embed_chunks(client: OpenAI, chunks: list[dict]) -> list[dict]:
    """Vectorise les chunks avec OpenAI text-embedding-3-small."""
    texts = [c["text"] for c in chunks]
    response = client.embeddings.create(model=EMBED_MODEL, input=texts)
    for i, chunk in enumerate(chunks):
        chunk["embedding"] = response.data[i].embedding
    return chunks


def upsert_to_pinecone(index, chunks: list[dict]) -> None:
    """Pousse les chunks dans Pinecone par lots."""
    vectors = [
        {
            "id": c["id"],
            "values": c["embedding"],
            "metadata": {"source": c["source"], "page": c["page"], "text": c["text"]},
        }
        for c in chunks
    ]
    for i in range(0, len(vectors), BATCH_SIZE):
        batch = vectors[i : i + BATCH_SIZE]
        index.upsert(vectors=batch)
        print(f"  Upsert lot {i // BATCH_SIZE + 1} ({len(batch)} vecteurs)")


def main():
    parser = argparse.ArgumentParser(description="Ingestion PDF → Pinecone pour Aidénia")
    parser.add_argument("--file", required=True, help="Chemin vers le fichier PDF")
    parser.add_argument("--source", required=True, help="Nom de la source (ex: 'CGV FlowDiff')")
    args = parser.parse_args()

    pdf_path = Path(args.file)
    if not pdf_path.exists():
        raise FileNotFoundError(f"Fichier introuvable : {pdf_path}")

    openai_key = os.environ.get("OPENAI_API_KEY")
    pinecone_key = os.environ.get("PINECONE_API_KEY")
    index_name = os.environ.get("PINECONE_INDEX", "flowdiff-docs")

    if not openai_key or not pinecone_key:
        raise EnvironmentError("OPENAI_API_KEY et PINECONE_API_KEY requis dans .env")

    print(f"📄 Lecture de {pdf_path.name}…")
    pages = extract_text_from_pdf(str(pdf_path))
    print(f"   {len(pages)} pages extraites")

    all_chunks: list[dict] = []
    for page_data in pages:
        chunks = chunk_text(page_data["text"], args.source, page_data["page"])
        all_chunks.extend(chunks)
    print(f"   {len(all_chunks)} chunks créés")

    print("🔢 Vectorisation avec OpenAI…")
    openai_client = OpenAI(api_key=openai_key)
    all_chunks = embed_chunks(openai_client, all_chunks)

    print("📌 Connexion à Pinecone…")
    pc = Pinecone(api_key=pinecone_key)

    if index_name not in [i.name for i in pc.list_indexes()]:
        print(f"   Création de l'index '{index_name}'…")
        pc.create_index(
            name=index_name,
            dimension=EMBED_DIM,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )

    index = pc.Index(index_name)
    print(f"🚀 Upsert dans '{index_name}'…")
    upsert_to_pinecone(index, all_chunks)

    print(f"✅ Ingestion terminée — {len(all_chunks)} chunks depuis '{args.source}'")


if __name__ == "__main__":
    main()
