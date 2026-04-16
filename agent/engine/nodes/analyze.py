from typing import List, Dict, Any
from engine.state import AgentState


def analyze_node(state: AgentState) -> AgentState:
    collected = state.get("collected", [])
    analyses = []

    for item in collected:
        analysis = analyze_explain(item)
        analyses.append(analysis)

    return {**state, "analyses": analyses}


def analyze_explain(item: Dict[str, Any]) -> str:
    query = item.get("query", "")
    explain = item.get("explain", [])
    db_type = item.get("db_type", "postgresql")
    tables = item.get("tables", [])

    if not explain:
        return f"无法获取查询计划: {query}"

    analysis_parts = []

    if db_type == "mysql":
        analysis = analyze_mysql_explain(explain, tables)
    else:
        analysis = analyze_pg_explain(explain, tables)

    analysis_parts.append(analysis)

    return "\n".join(analysis_parts)


def analyze_mysql_explain(explain: List[Dict], tables: List[str]) -> str:
    issues = []

    for row in explain:
        access_type = row.get("type", "")
        key_used = row.get("key", "")
        rows_examined = row.get("rows", 0)
        extra = row.get("Extra", "")

        if access_type in ["ALL", "index"]:
            issues.append(f"全表扫描 (type={access_type})")

        if not key_used and access_type not in ["ALL", "index"]:
            issues.append("未使用索引")

        if isinstance(rows_examined, int) and rows_examined > 10000:
            issues.append(f"扫描行数过多: {rows_examined}")

        if "Using filesort" in extra:
            issues.append("使用 filesort，性能较差")

        if "Using temporary" in extra:
            issues.append("使用临时表，性能较差")

    if issues:
        return f"分析: {'; '.join(issues)}"
    return "分析: 查询使用了最优访问路径"


def analyze_pg_explain(explain: Dict, tables: List[str]) -> str:
    issues = []

    if isinstance(explain, dict):
        plan = explain.get("Plan", {})
        node_type = plan.get("Node Type", "")
        total_cost = plan.get("Total Cost", 0)
        rows = plan.get("Relation Name", "")

        if "Seq Scan" in node_type:
            issues.append(f"顺序扫描 (Node Type: {node_type})")

        if total_cost > 100:
            issues.append(f"成本较高: {total_cost}")

        if "Sort" in node_type:
            issues.append("需要排序操作")

        if "Hash" in node_type:
            issues.append("使用哈希连接")

    if issues:
        return f"分析: {'; '.join(issues)}"
    return "分析: 查询成本合理"
