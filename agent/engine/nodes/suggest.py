from typing import List, Dict, Any
from engine.state import AgentState


def suggest_node(state: AgentState) -> AgentState:
    analyses = state.get("analyses", [])
    collected = state.get("collected", [])
    suggestions = generate_suggestions(analyses, collected)

    return {**state, "suggestions": suggestions}


def generate_suggestions(
    analyses: List[str], collected: List[Dict[str, Any]]
) -> List[str]:
    suggestions = []
    has_errors = any(item.get("errors") for item in collected)

    for analysis in analyses:
        if "全表扫描" in analysis or "顺序扫描" in analysis:
            suggestions.append("建议: 在 WHERE 条件列或 JOIN 列上创建索引")

        if "未使用索引" in analysis:
            suggestions.append("建议: 检查索引是否合适，考虑使用复合索引")

        if "扫描行数过多" in analysis:
            suggestions.append("建议: 添加 WHERE 条件减少扫描范围")

        if "filesort" in analysis or "排序操作" in analysis or "ORDER BY" in analysis:
            suggestions.append("建议: 在 ORDER BY 列上创建索引以避免额外排序")

        if "临时表" in analysis or "GROUP BY" in analysis:
            suggestions.append("建议: 在 GROUP BY 列上创建索引以避免临时表")

        if "YEAR()" in analysis or "日期列使用函数" in analysis:
            suggestions.append(
                "建议: 将 YEAR(col) = 2025 改为范围条件 col BETWEEN '2025-01-01' AND '2025-12-31 23:59:59'，可复用索引"
            )

        if "LOWER/UPPER" in analysis or "大小写函数" in analysis:
            suggestions.append(
                "建议: 将 LOWER(col) LIKE '...' 改为 col LIKE '...'（如列使用 utf8_general_ci 排序规则则大小写不敏感），或建立函数索引"
            )

        if "前置通配符" in analysis:
            suggestions.append(
                "建议: LIKE '%xxx%' 无法使用 B-tree 索引，考虑使用全文索引（FULLTEXT）或搜索引擎"
            )

        if "SELECT *" in analysis:
            suggestions.append("建议: 将 SELECT * 改为明确的列名，减少数据传输量")

        if "JOIN" in analysis and "索引" in analysis:
            suggestions.append("建议: 确保 JOIN 的关联列（ON 子句中的列）上有索引")

    if has_errors and not suggestions:
        suggestions.append("建议: 表不存在或数据库连接失败，请先创建所需表后重新诊断")
    elif not suggestions:
        suggestions.append("当前查询计划良好，无需特殊优化")

    suggestions.append("建议: 部署到真实数据库后使用 EXPLAIN 验证实际执行计划")

    return suggestions
