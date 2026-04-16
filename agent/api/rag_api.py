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
