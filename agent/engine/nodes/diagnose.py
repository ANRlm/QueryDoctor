from typing import Dict, Any, List
from engine.state import AgentState


def diagnose_node(state: AgentState) -> AgentState:
    analyses = state.get("analyses", [])
    collected = state.get("collected", [])

    diagnosis = generate_diagnosis(analyses, collected)

    return {**state, "diagnosis": diagnosis}


def generate_diagnosis(analyses: List[str], collected: List[Dict]) -> str:
    if not analyses:
        return "未能分析查询计划"

    errors = []
    problems = []

    for i, collected_item in enumerate(collected):
        if collected_item.get("errors"):
            errors.extend(collected_item["errors"])

    for i, analysis in enumerate(analyses):
        if "全表扫描" in analysis or "顺序扫描" in analysis:
            problems.append(f"查询 {i + 1}: 发现全表/顺序扫描")
        if "未使用索引" in analysis:
            problems.append(f"查询 {i + 1}: 未使用索引")
        if "扫描行数过多" in analysis:
            problems.append(f"查询 {i + 1}: 扫描行数过多")
        if "filesort" in analysis or "排序操作" in analysis or "ORDER BY" in analysis:
            problems.append(f"查询 {i + 1}: 存在排序操作，可能需要索引支持")
        if "临时表" in analysis or "GROUP BY" in analysis:
            problems.append(f"查询 {i + 1}: 可能使用临时表")
        if "索引失效" in analysis:
            problems.append(f"查询 {i + 1}: WHERE 条件中存在导致索引失效的写法")
        if "前置通配符" in analysis:
            problems.append(f"查询 {i + 1}: LIKE 前置通配符将导致全表扫描")
        if "SELECT *" in analysis:
            problems.append(f"查询 {i + 1}: SELECT * 会读取不必要的列")
        if "JOIN" in analysis and "索引" in analysis:
            problems.append(f"查询 {i + 1}: JOIN 关联列需要确认索引")

    error_note = ""
    if errors:
        error_summary = "; ".join(errors[:2])
        if len(errors) > 2:
            error_summary += f"（共 {len(errors)} 个错误）"
        error_note = f"注: 数据库执行错误 ({error_summary})，以下为 SQL 静态分析结果\n"

    if not problems:
        if error_note:
            return f"诊断结论: {error_note}未从 SQL 文本中发现明显性能问题"
        return "诊断结论: 查询计划正常，未发现明显性能问题"

    return "诊断结论:\n" + error_note + "\n".join(f"- {p}" for p in problems)
