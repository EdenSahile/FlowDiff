"""
Ingestion URL → Pinecone pour Aidénia.
Usage : python scripts/ingest_url.py --url https://example.com/faq --source "FAQ FlowDiff"
Prérequis : pip install requests beautifulsoup4 openai pinecone-client python-dotenv
"""

import argparse
import os
import uuid

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
EMBED_MODEL = "text-embedding-3-small"
EMBED_DIM = 1536
BATCH_SIZE = 100


def scrape_url(url: str) -> str:
    """Récupère et nettoie le texte d'une page web."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; AideniaBot/1.0)"}
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Supprime les éléments non textuels
    for tag in soup(["script", "style", "nav", "footer", "header", "iframe", "noscript"]):
        tag.decompose()

    text = soup.get_text(separator="\n")
    # Normalise les espaces et sauts de ligne multiples
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def chunk_text(text: str, source: str) -> list[dict]:
    """Découpe un texte en chunks avec chevauchement."""
    words = text.split()
    chunks = []
    start = 0
    chunk_index = 0
    while start < len(words):
        end = min(start + CHUNK_SIZE, len(words))
        chunks.append({
            "id": str(uuid.uuid4()),
            "text": " ".join(words[start:end]),
            "source": source,
            "chunk_index": chunk_index,
        })
        if end == len(words):
            break
        start += CHUNK_SIZE - CHUNK_OVERLAP
        chunk_index += 1
    return chunks


def embed_chunks(client: OpenAI, chunks: list[dict]) -> list[dict]:
    texts = [c["text"] for c in chunks]
    response = client.embeddings.create(model=EMBED_MODEL, input=texts)
    for i, chunk in enumerate(chunks):
        chunk["embedding"] = response.data[i].embedding
    return chunks


def upsert_to_pinecone(index, chunks: list[dict]) -> None:
    vectors = [
        {
            "id": c["id"],
            "values": c["embedding"],
            "metadata": {
                "source": c["source"],
                "chunk_index": c["chunk_index"],
                "text": c["text"],
            },
        }
        for c in chunks
    ]
    for i in range(0, len(vectors), BATCH_SIZE):
        batch = vectors[i : i + BATCH_SIZE]
        index.upsert(vectors=batch)
        print(f"  Upsert lot {i // BATCH_SIZE + 1} ({len(batch)} vecteurs)")


def main():
    parser = argparse.ArgumentParser(description="Ingestion URL → Pinecone pour Aidénia")
    parser.add_argument("--url", required=True, help="URL à ingérer")
    parser.add_argument("--source", required=True, help="Nom de la source (ex: 'FAQ FlowDiff')")
    args = parser.parse_args()

    openai_key = os.environ.get("OPENAI_API_KEY")
    pinecone_key = os.environ.get("PINECONE_API_KEY")
    index_name = os.environ.get("PINECONE_INDEX", "flowdiff-docs")

    if not openai_key or not pinecone_key:
        raise EnvironmentError("OPENAI_API_KEY et PINECONE_API_KEY requis dans .env")

    print(f"🌐 Scraping de {args.url}…")
    text = scrape_url(args.url)
    word_count = len(text.split())
    print(f"   {word_count} mots extraits")

    if word_count < 10:
        raise ValueError("Contenu trop court ou page vide — vérifiez l'URL")

    chunks = chunk_text(text, args.source)
    print(f"   {len(chunks)} chunks créés")

    print("🔢 Vectorisation avec OpenAI…")
    openai_client = OpenAI(api_key=openai_key)
    chunks = embed_chunks(openai_client, chunks)

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
    upsert_to_pinecone(index, chunks)

    print(f"✅ Ingestion terminée — {len(chunks)} chunks depuis '{args.source}'")


if __name__ == "__main__":
    main()
