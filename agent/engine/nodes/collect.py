from typing import Dict, Any, List
from engine.state import AgentState
from db.mysql_client import MySQLClient
from db.postgres_client import PostgresClient


def collect_node(state: AgentState) -> AgentState:
    queries = state.get("queries", [])
    db_type = state.get("db_type", "postgresql")
    collected = []

    for query in queries:
        info = collect_query_info(query, db_type)
        collected.append(info)

    return {**state, "collected": collected}


def collect_query_info(query: str, db_type: str = "postgresql") -> Dict[str, Any]:

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
        else:
            info["explain"] = PostgresClient().explain_query(query)
            info["tables"] = extract_tables_pg(query)
    except Exception as e:
        info["errors"].append(str(e))

    return info


def extract_tables_mysql(query: str) -> List[str]:
    import re

    pattern = r"FROM\s+`?(\w+)`?"
    tables = re.findall(pattern, query, re.IGNORECASE)
    return tables


def extract_tables_pg(query: str) -> List[str]:
    import re

    pattern = r'FROM\s+"?(\w+)"?'
    tables = re.findall(pattern, query, re.IGNORECASE)
    return tables
