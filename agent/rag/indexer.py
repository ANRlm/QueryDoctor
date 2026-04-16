import os
from typing import List, Optional
from dataclasses import dataclass

import chromadb
from chromadb.config import Settings


@dataclass
class DiagnosticRecord:
    query: str
    diagnosis: str
    suggestions: List[str]
    timestamp: Optional[str] = None


class DiagnosticIndexer:
    def __init__(self, config=None):
        self.config = config or RAGConfig()
        os.makedirs(self.config.persist_directory, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=self.config.persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=self.config.collection_name,
            metadata={"description": "Diagnostic knowledge base"}
        )
        self._embedding_function = None

    def _get_embedding_function(self):
        if self._embedding_function is None:
            from chromadb.utils import embedding_functions
            self._embedding_function = embedding_functions.OpenAIEmbeddingFunction(
                api_key=os.getenv("OPENAI_API_KEY", ""),
                model_name=self.config.embedding_model
            )
        return self._embedding_function

    def add_diagnostic(self, record: DiagnosticRecord, doc_id: Optional[str] = None) -> str:
        if doc_id is None:
            doc_id = f"diag_{record.query[:50]}_{record.timestamp or 'unknown'}"
        
        document = f"Query: {record.query}\nDiagnosis: {record.diagnosis}\nSuggestions: {' '.join(record.suggestions)}"
        
        self.collection.add(
            documents=[document],
            ids=[doc_id],
            metadatas=[{
                "query": record.query,
                "diagnosis": record.diagnosis,
                "suggestions": ",".join(record.suggestions),
                "timestamp": record.timestamp or ""
            }]
        )
        return doc_id

    def add_diagnostics(self, records: List[DiagnosticRecord]) -> List[str]:
        return [self.add_diagnostic(r) for r in records]

    def delete_diagnostic(self, doc_id: str) -> None:
        self.collection.delete(ids=[doc_id])

    def get_collection_count(self) -> int:
        return self.collection.count()
