from typing import TypedDict, Optional, List, Any, Dict


class AgentState(TypedDict):
    queries: List[str]
    collected: List[Any]
    analyses: List[str]
    diagnosis: Optional[str]
    suggestions: List[str]
    formatted: Dict[str, Any]
