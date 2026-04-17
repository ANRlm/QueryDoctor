from datetime import datetime
from typing import Dict, Any
from engine.state import AgentState


def format_node(state: AgentState) -> AgentState:
    formatted = format_output(state)
    _save_to_rag(state)
    return {**state, "formatted": formatted}


def format_output(state: AgentState) -> Dict[str, Any]:
    queries = state.get("queries", [])
    analyses = state.get("analyses", [])
    diagnosis = state.get("diagnosis", "")
    suggestions = state.get("suggestions", [])

    return {
        "queries": queries,
        "analyses": analyses,
        "diagnosis": diagnosis,
        "suggestions": suggestions,
    }


def _save_to_rag(state: AgentState) -> None:
    queries = state.get("queries", [])
    diagnosis = state.get("diagnosis", "")
    suggestions = state.get("suggestions", [])

    if not queries or not diagnosis:
        return

    try:
        from rag.indexer import DiagnosticIndexer, DiagnosticRecord

        indexer = DiagnosticIndexer()
        record = DiagnosticRecord(
            query=queries[0],
            diagnosis=diagnosis,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat(),
        )
        indexer.add_diagnostic(record)
    except Exception:
        pass
