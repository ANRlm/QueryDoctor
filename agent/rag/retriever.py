from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from rag.indexer import DiagnosticIndexer, DiagnosticRecord
from rag.config import RAGConfig


@dataclass
class RetrievedDiagnostic:
    query: str
    diagnosis: str
    suggestions: List[str]
    score: float


class DiagnosticRetriever:
    def __init__(self, indexer: Optional[DiagnosticIndexer] = None, config=None):
        self.config = config or RAGConfig()
        self.indexer = indexer or DiagnosticIndexer(self.config)

    def retrieve_similar(
        self, 
        query: str, 
        top_k: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[RetrievedDiagnostic]:
        results = self.indexer.collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        retrieved = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                distance = results["distances"][0][i] if results["distances"] else 1.0
                score = 1.0 - distance
                
                if score >= similarity_threshold:
                    meta = results["metadatas"][0][i] if results["metadatas"] else {}
                    retrieved.append(RetrievedDiagnostic(
                        query=meta.get("query", ""),
                        diagnosis=meta.get("diagnosis", ""),
                        suggestions=meta.get("suggestions", "").split(",") if meta.get("suggestions") else [],
                        score=score
                    ))
        
        return retrieved

    def retrieve_as_context(self, query: str, top_k: int = 3) -> str:
        similar = self.retrieve_similar(query, top_k=top_k)
        
        if not similar:
            return ""
        
        context_parts = []
        for i, diag in enumerate(similar, 1):
            context_parts.append(
                f"参考 {i} (相似度: {diag.score:.2f}):\n"
                f"问题: {diag.query}\n"
                f"诊断: {diag.diagnosis}\n"
                f"建议: {', '.join(diag.suggestions)}"
            )
        
        return "\n\n".join(context_parts)
