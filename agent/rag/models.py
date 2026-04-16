from typing import List, Optional
from pydantic import BaseModel


class DiagnosticRecordInput(BaseModel):
    query: str
    diagnosis: str
    suggestions: List[str]
    timestamp: Optional[str] = None


class DiagnosticRecordOutput(BaseModel):
    id: str
    query: str
    diagnosis: str
    suggestions: List[str]
    timestamp: Optional[str] = None


class RAGQueryInput(BaseModel):
    query: str
    top_k: int = 5
    similarity_threshold: float = 0.7


class RetrievedDiagnosticOutput(BaseModel):
    query: str
    diagnosis: str
    suggestions: List[str]
    score: float


class RAGQueryOutput(BaseModel):
    results: List[RetrievedDiagnosticOutput]
    context: str
