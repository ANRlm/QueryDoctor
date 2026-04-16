from typing import TypedDict, Optional, List


class AgentState(TypedDict):
    queries: List[str]
    analyses: List[str]
    diagnosis: Optional[str]
    suggestions: List[str]
