import os
from dataclasses import dataclass


@dataclass
class RAGConfig:
    persist_directory: str = os.getenv("RAG_PERSIST_DIR", "./data/vectorstore")
    collection_name: str = os.getenv("RAG_COLLECTION", "diagnostics")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-ada-002")
    chunk_size: int = 512
    chunk_overlap: int = 50
