import os
import tempfile
import pytest

os.environ["OPENAI_API_KEY"] = "test-key"

from agent.rag import DiagnosticIndexer, DiagnosticRetriever, RAGConfig
from agent.rag.indexer import DiagnosticRecord
from agent.rag.retriever import RetrievedDiagnostic


class TestDiagnosticIndexer:
    def test_indexer_initialization(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            config = RAGConfig(persist_directory=tmpdir, collection_name="test")
            indexer = DiagnosticIndexer(config)
            assert indexer.get_collection_count() == 0

    def test_add_diagnostic(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            config = RAGConfig(persist_directory=tmpdir, collection_name="test")
            indexer = DiagnosticIndexer(config)
            
            record = DiagnosticRecord(
                query="slow SELECT query",
                diagnosis="missing index on user_id",
                suggestions=["add index", "rewrite query"],
                timestamp="2024-01-01"
            )
            
            doc_id = indexer.add_diagnostic(record)
            assert doc_id is not None
            assert indexer.get_collection_count() == 1

    def test_delete_diagnostic(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            config = RAGConfig(persist_directory=tmpdir, collection_name="test")
            indexer = DiagnosticIndexer(config)
            
            record = DiagnosticRecord(
                query="slow query",
                diagnosis="diagnosis",
                suggestions=["suggestion"],
                timestamp="2024-01-01"
            )
            
            doc_id = indexer.add_diagnostic(record)
            assert indexer.get_collection_count() == 1
            
            indexer.delete_diagnostic(doc_id)
            assert indexer.get_collection_count() == 0


class TestDiagnosticRetriever:
    def test_retriever_initialization(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            config = RAGConfig(persist_directory=tmpdir, collection_name="test")
            indexer = DiagnosticIndexer(config)
            retriever = DiagnosticRetriever(indexer, config)
            assert retriever.indexer is not None

    def test_retrieve_similar_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            config = RAGConfig(persist_directory=tmpdir, collection_name="test")
            indexer = DiagnosticIndexer(config)
            retriever = DiagnosticRetriever(indexer, config)
            
            results = retriever.retrieve_similar("nonexistent query", top_k=5)
            assert isinstance(results, list)

    def test_retrieve_as_context_empty(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            config = RAGConfig(persist_directory=tmpdir, collection_name="test")
            indexer = DiagnosticIndexer(config)
            retriever = DiagnosticRetriever(indexer, config)
            
            context = retriever.retrieve_as_context("test query", top_k=3)
            assert context == ""
