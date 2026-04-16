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

    problems = []

    for i, analysis in enumerate(analyses):
        if "全表扫描" in analysis or "顺序扫描" in analysis:
            problems.append(f"查询 {i + 1}: 发现全表/顺序扫描")
        if "未使用索引" in analysis:
            problems.append(f"查询 {i + 1}: 未使用索引")
        if "扫描行数过多" in analysis:
            problems.append(f"查询 {i + 1}: 扫描行数过多")
        if "filesort" in analysis or "排序操作" in analysis:
            problems.append(f"查询 {i + 1}: 存在排序操作")
        if "临时表" in analysis:
            problems.append(f"查询 {i + 1}: 使用临时表")

    if not problems:
        return "诊断结论: 查询计划正常，未发现明显性能问题"

    return "诊断结论:\n" + "\n".join(f"- {p}" for p in problems)
