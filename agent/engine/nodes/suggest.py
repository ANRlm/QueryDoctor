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

    if has_errors:
        suggestions.append("建议: 请先解决上述数据库连接/执行错误")
        return suggestions

    for analysis in analyses:
        if "全表扫描" in analysis or "顺序扫描" in analysis:
            suggestions.append("建议: 在 WHERE 条件列或 JOIN 列上创建索引")

        if "未使用索引" in analysis:
            suggestions.append("建议: 检查索引是否合适，考虑使用复合索引")

        if "扫描行数过多" in analysis:
            suggestions.append("建议: 添加 WHERE 条件减少扫描范围")

        if "filesort" in analysis or "排序操作" in analysis:
            suggestions.append("建议: 在排序列上创建索引以消除排序")

        if "临时表" in analysis:
            suggestions.append("建议: 优化查询避免使用临时表")

    if not suggestions:
        suggestions.append("当前查询计划良好，无需特殊优化")

    suggestions.append("建议: 使用 EXPLAIN 分析实际执行计划进行验证")

    return suggestions
