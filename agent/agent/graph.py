from langgraph.graph import StateGraph, START, END
from agent.state import AgentState
from agent.nodes import (
    collect_node,
    analyze_node,
    diagnose_node,
    suggest_node,
    format_node,
)


builder = StateGraph(AgentState)

builder.add_node("collect", collect_node)
builder.add_node("analyze", analyze_node)
builder.add_node("diagnose", diagnose_node)
builder.add_node("suggest", suggest_node)
builder.add_node("format", format_node)

builder.add_edge(START, "collect")
builder.add_edge("collect", "analyze")
builder.add_edge("analyze", "diagnose")
builder.add_edge("diagnose", "suggest")
builder.add_edge("suggest", "format")
builder.add_edge("format", END)

compiled_graph = builder.compile()
