from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag import DiagnosticIndexer, DiagnosticRetriever, RAGConfig
from rag.indexer import DiagnosticRecord
from rag.models import (
    DiagnosticRecordInput,
    DiagnosticRecordOutput,
    RAGQueryInput,
    RAGQueryOutput,
    RetrievedDiagnosticOutput,
)


router = APIRouter(prefix="/rag", tags=["RAG"])

_indexer: DiagnosticIndexer = None
_retriever: DiagnosticRetriever = None


def get_indexer() -> DiagnosticIndexer:
    global _indexer
    if _indexer is None:
        _indexer = DiagnosticIndexer(RAGConfig())
    return _indexer


def get_retriever() -> DiagnosticRetriever:
    global _retriever
    if _retriever is None:
        _retriever = DiagnosticRetriever(get_indexer())
    return _retriever


class IndexRequest(BaseModel):
    records: List[DiagnosticRecordInput]


class IndexResponse(BaseModel):
    indexed_count: int
    collection_count: int


@router.post("/index", response_model=IndexResponse)
async def index_diagnostics(request: IndexRequest):
    indexer = get_indexer()
    
    records = [
        DiagnosticRecord(
            query=r.query,
            diagnosis=r.diagnosis,
            suggestions=r.suggestions,
            timestamp=r.timestamp
        )
        for r in request.records
    ]
    
    indexer.add_diagnostics(records)
    
    return IndexResponse(
        indexed_count=len(records),
        collection_count=indexer.get_collection_count()
    )


@router.post("/query", response_model=RAGQueryOutput)
async def query_diagnostics(request: RAGQueryInput):
    retriever = get_retriever()
    
    results = retriever.retrieve_similar(
        query=request.query,
        top_k=request.top_k,
        similarity_threshold=request.similarity_threshold
    )
    
    context = retriever.retrieve_as_context(
        query=request.query,
        top_k=min(request.top_k, 3)
    )
    
    return RAGQueryOutput(
        results=[
            RetrievedDiagnosticOutput(
                query=r.query,
                diagnosis=r.diagnosis,
                suggestions=r.suggestions,
                score=r.score
            )
            for r in results
        ],
        context=context
    )


@router.get("/stats")
async def get_stats():
    indexer = get_indexer()
    return {
        "collection_count": indexer.get_collection_count(),
        "collection_name": indexer.config.collection_name
    }


@router.get("/list")
async def list_diagnostics(limit: int = 20, offset: int = 0):
    try:
        import os, chromadb
        from chromadb.config import Settings
        from rag.config import RAGConfig
        cfg = RAGConfig()
        client = chromadb.PersistentClient(
            path=cfg.persist_directory,
            settings=Settings(anonymized_telemetry=False),
        )
        collection = client.get_or_create_collection(name=cfg.collection_name)
        result = collection.get(
            limit=limit,
            offset=offset,
            include=["metadatas", "documents"],
        )
        items = []
        ids = result.get("ids") or []
        metadatas = result.get("metadatas") or []
        documents = result.get("documents") or []
        for i, doc_id in enumerate(ids):
            meta = metadatas[i] if i < len(metadatas) else {}
            doc = documents[i] if i < len(documents) else ""
            suggestions_raw = meta.get("suggestions", "")
            suggestions = [s.strip() for s in suggestions_raw.split(",") if s.strip()] if suggestions_raw else []
            items.append({
                "id": doc_id,
                "query": meta.get("query", doc),
                "diagnosis": meta.get("diagnosis", ""),
                "suggestions": suggestions,
                "timestamp": meta.get("timestamp", ""),
            })
        items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return {"items": items, "total": len(items)}
    except Exception as e:
        return {"items": [], "total": 0, "error": str(e)}
