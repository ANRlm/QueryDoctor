from typing import Dict, Any
from engine.state import AgentState


def format_node(state: AgentState) -> AgentState:
    formatted = format_output(state)
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
