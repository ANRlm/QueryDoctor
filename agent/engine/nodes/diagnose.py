from typing import Dict, Any, List, Optional
from openai import OpenAI
from engine.state import AgentState
from config import config


def diagnose_node(state: AgentState) -> AgentState:
    analyses = state.get("analyses", [])
    collected = state.get("collected", [])
    queries = state.get("queries", [])

    diagnosis = _llm_diagnose(queries, analyses) or _rule_diagnose(analyses, collected)

    return {**state, "diagnosis": diagnosis}


def _llm_diagnose(queries: List[str], analyses: List[str]) -> Optional[str]:
    if not config.OPENAI_API_KEY:
        return None

    queries_text = "\n".join(f"查询 {i + 1}: {q}" for i, q in enumerate(queries))
    analysis_text = "\n".join(f"分析 {i + 1}: {a}" for i, a in enumerate(analyses))

    prompt = f"""以下是需要诊断的 SQL 查询及其分析结果：

SQL 查询：
{queries_text}

分析结果：
{analysis_text}

请基于以上分析，用 2-4 条简洁的要点给出诊断结论，指出主要性能问题。每条以 "- " 开头。"""

    try:
        client = OpenAI(api_key=config.OPENAI_API_KEY, base_url=config.OPENAI_BASE_URL)
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "你是一个数据库性能优化专家，擅长分析 SQL 慢查询问题。请用中文回答，简洁专业。",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=500,
        )
        result = response.choices[0].message.content.strip()
        return f"诊断结论（AI 分析）:\n{result}"
    except Exception:
        return None


def _rule_diagnose(analyses: List[str], collected: List[Dict]) -> str:
    if not analyses:
        return "未能分析查询计划"

    errors = []
    problems = []

    for collected_item in collected:
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
