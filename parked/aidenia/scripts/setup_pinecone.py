"""
Création de l'index Pinecone pour Aidénia.
Usage : python scripts/setup_pinecone.py
Prérequis : pip install pinecone-client python-dotenv
"""

import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

INDEX_NAME = os.environ.get("PINECONE_INDEX", "flowdiff-docs")
DIMENSION = 1536   # text-embedding-3-small
METRIC = "cosine"


def main():
    pinecone_key = os.environ.get("PINECONE_API_KEY")
    if not pinecone_key:
        raise EnvironmentError("PINECONE_API_KEY manquante dans .env")

    pc = Pinecone(api_key=pinecone_key)
    existing = [i.name for i in pc.list_indexes()]

    if INDEX_NAME in existing:
        print(f"✅ L'index '{INDEX_NAME}' existe déjà — rien à faire.")
        return

    print(f"🚀 Création de l'index '{INDEX_NAME}' (dim={DIMENSION}, metric={METRIC})…")
    pc.create_index(
        name=INDEX_NAME,
        dimension=DIMENSION,
        metric=METRIC,
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    print(f"✅ Index '{INDEX_NAME}' créé avec succès.")


if __name__ == "__main__":
    main()
