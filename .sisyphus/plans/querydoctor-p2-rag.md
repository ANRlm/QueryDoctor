# P2-RAG 知识库计划

## TL;DR
- 目标：在 Python Agent 中集成 RAG，实现诊断知识积累与复用
- 交付物：LlamaIndex RAG 模块、向量存储、历史诊断检索
- 工作量：大

## 背景与范围
- P1-MongoDB（待完成）将提供数据存储能力
- RAG 用于存储历史诊断结论与优化方案
- 基于向量相似度检索相似问题
- 不改动 Go Gateway 架构

## 目标/工作项
- [x] 1) agent/rag/ 目录结构：创建 RAG 模块
- [x] 2) 向量存储配置：ChromaDB 本地存储
- [x] 3) 诊断知识索引：存储历史诊断结论
- [x] 4) 检索与生成：retrieve + generate_answer
- [x] 5) RAG API 端点：/rag/index, /rag/query, /rag/stats
- [x] 6) 测试用例：RAG 检索测试
- [x] 7) 文档更新：Notepad

## 技术决策
- 向量数据库：ChromaDB（本地、轻量）
- Embedding：OpenAI Embeddings 标准格式
- LLM 接口：OpenAI Chat Completion 标准格式
- 模式参考：datawhalechina/llm-cookbook, SuperAGI

## 关键路径
环境配置 → 向量存储 → LlamaIndex 集成 → 索引构建 → 检索测试

## 依赖
- llama-index
- chromadb
- langchain 或 langchain-core（embedding）
- openai

## 验证策略
- Python 测试通过
- RAG 检索返回相关历史诊断
- 向量相似度匹配正确

## Notepad 路径
.sisyphus/notepads/querydoctor-p2-rag/
