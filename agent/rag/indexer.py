import os
import hashlib
from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime

import chromadb
from chromadb.config import Settings

from rag.config import RAGConfig


@dataclass
class DiagnosticRecord:
    query: str
    diagnosis: str
    suggestions: List[str]
    timestamp: Optional[str] = None


class DiagnosticIndexer:
    def __init__(self, config=None):
        self.config = config or RAGConfig()
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY required for RAG indexing")

        from chromadb.utils import embedding_functions

        ef = embedding_functions.OpenAIEmbeddingFunction(
            api_key=api_key,
            api_base=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            model_name=self.config.embedding_model,
        )

        os.makedirs(self.config.persist_directory, exist_ok=True)
        self.client = chromadb.PersistentClient(
            path=self.config.persist_directory,
            settings=Settings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=self.config.collection_name,
            embedding_function=ef,
            metadata={"description": "Diagnostic knowledge base"},
        )

    def add_diagnostic(self, record: DiagnosticRecord, doc_id: Optional[str] = None) -> str:
        if doc_id is None:
            ts = record.timestamp or datetime.now().isoformat()
            raw = f"{record.query}_{ts}"
            doc_id = "diag_" + hashlib.md5(raw.encode()).hexdigest()

        document = (
            f"Query: {record.query}\n"
            f"Diagnosis: {record.diagnosis}\n"
            f"Suggestions: {' '.join(record.suggestions)}"
        )

        self.collection.add(
            documents=[document],
            ids=[doc_id],
            metadatas=[
                {
                    "query": record.query,
                    "diagnosis": record.diagnosis,
                    "suggestions": ",".join(record.suggestions),
                    "timestamp": record.timestamp or "",
                }
            ],
        )
        return doc_id

    def add_diagnostics(self, records: List[DiagnosticRecord]) -> List[str]:
        return [self.add_diagnostic(r) for r in records]

    def delete_diagnostic(self, doc_id: str) -> None:
        self.collection.delete(ids=[doc_id])

    def get_collection_count(self) -> int:
        return self.collection.count()
