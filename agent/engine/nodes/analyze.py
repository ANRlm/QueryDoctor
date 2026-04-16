import re
from typing import List, Dict, Any
from engine.state import AgentState


def analyze_node(state: AgentState) -> AgentState:
    collected = state.get("collected", [])
    analyses = []

    for item in collected:
        analysis = analyze_explain(item)
        analyses.append(analysis)

    return {**state, "analyses": analyses}


def analyze_sql_static(query: str) -> List[str]:
    issues = []
    q = query.upper()

    if re.search(r"SELECT\s+\*", q):
        issues.append("使用了 SELECT *，建议明确指定所需列")

    if re.search(r"\bYEAR\s*\(|\bMONTH\s*\(|\bDATE\s*\(|\bDATE_FORMAT\s*\(", q):
        issues.append("WHERE 子句对日期列使用函数（如 YEAR()），导致索引失效；建议改用范围条件")

    if re.search(r"\bLOWER\s*\(|\bUPPER\s*\(", q):
        issues.append("WHERE 子句对列使用大小写函数（LOWER/UPPER），导致索引失效")

    if re.search(r"LIKE\s+'%", q):
        issues.append("LIKE '%...' 使用了前置通配符，B-tree 索引无法生效，将导致全表扫描")

    join_count = len(re.findall(r"\bJOIN\b", q))
    if join_count > 0:
        issues.append(f"包含 {join_count} 个 JOIN，请确认关联列上存在索引")

    if re.search(r"\bORDER\s+BY\b", q):
        issues.append("包含 ORDER BY，若排序列无索引支持将产生额外排序开销")

    if re.search(r"\bGROUP\s+BY\b", q):
        issues.append("包含 GROUP BY，若分组列无索引支持将使用临时表")

    return issues


def analyze_explain(item: Dict[str, Any]) -> str:
    query = item.get("query", "")
    explain = item.get("explain", [])
    db_type = item.get("db_type", "postgresql")
    tables = item.get("tables", [])

    static_issues = analyze_sql_static(query)

    if not explain:
        if static_issues:
            return "静态分析 (无执行计划): " + "; ".join(static_issues)
        return f"无法获取查询计划: {query}"

    if db_type == "mysql":
        explain_analysis = analyze_mysql_explain(explain, tables)
    else:
        explain_analysis = analyze_pg_explain(explain, tables)

    parts = [explain_analysis]
    if static_issues:
        parts.append("静态分析补充: " + "; ".join(static_issues))

    return "\n".join(parts)


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
