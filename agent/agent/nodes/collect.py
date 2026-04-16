from typing import Dict, Any, List
from agent.state import AgentState
from db.mysql_client import MySQLClient
from db.postgres_client import PostgresClient


def collect_node(state: AgentState) -> AgentState:
    queries = state.get("queries", [])
    if not queries:
        return state

    collected = []
    for query in queries:
        info = collect_query_info(query)
        collected.append(info)

    return {**state, "collected": collected}


def collect_query_info(query: str) -> Dict[str, Any]:
    db_type = detect_db_type(query)
    
    info = {
        "query": query,
        "db_type": db_type,
        "explain": None,
        "tables": [],
        "indexes": [],
        "errors": [],
    }
    
    try:
        if db_type == "mysql":
            info["explain"] = MySQLClient().explain_query(query)
            info["tables"] = extract_tables_mysql(query)
        elif db_type == "postgresql":
            info["explain"] = PostgresClient().explain_query(query)
            info["tables"] = extract_tables_pg(query)
    except Exception as e:
        info["errors"].append(str(e))
    
    return info


def detect_db_type(query: str) -> str:
    query_lower = query.lower().strip()
    if query_lower.startswith("select") or query_lower.startswith("insert") or query_lower.startswith("update") or query_lower.startswith("delete"):
        return "postgresql"
    return "postgresql"


def extract_tables_mysql(query: str) -> List[str]:
    import re
    pattern = r'FROM\s+`?(\w+)`?'
    tables = re.findall(pattern, query, re.IGNORECASE)
    return tables


def extract_tables_pg(query: str) -> List[str]:
    import re
    pattern = r'FROM\s+"?(\w+)"?'
    tables = re.findall(pattern, query, re.IGNORECASE)
    return tables
