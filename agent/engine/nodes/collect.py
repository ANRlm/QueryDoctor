from typing import Dict, Any, List
from engine.state import AgentState
from db.mysql_client import MySQLClient
from db.postgres_client import PostgresClient


def collect_node(state: AgentState) -> AgentState:
    queries = state.get("queries", [])
    db_type = state.get("db_type", "postgresql")
    db_config = state.get("db_config")
    collected = []

    for query in queries:
        info = collect_query_info(query, db_type, db_config)
        collected.append(info)

    return {**state, "collected": collected}


def collect_query_info(query: str, db_type: str = "postgresql", db_config: Dict[str, Any] = None) -> Dict[str, Any]:

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
            info["explain"] = MySQLClient(db_config).explain_query(query)
            info["tables"] = extract_tables_mysql(query)
        else:
            info["explain"] = PostgresClient(db_config).explain_query(query)
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
