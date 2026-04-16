# QueryDoctor 项目开发 Prompt

## 📌 项目基本信息

**项目名称：** QueryDoctor - AI 数据库慢查询诊断 Agent

**GitHub 仓库：** https://github.com/ANRlm/QueryDoctor.git

**核心目标：** 开发一个智能数据库诊断 Agent，能够自动分析慢查询、生成优化建议、支持多种数据库，并通过 RAG 实现诊断能力的自我迭代。

**开发规范：** 前后端分离设计，每次重大更新后同步更新 README 并推送到仓库。

---

## 🛠️ 技术栈

### 前端

| 类别 | 技术选型 |
|------|----------|
| 框架 | React 18 + TypeScript |
| UI 组件 | Ant Design |
| 状态管理 | Zustand |
| 图表可视化 | ECharts |
| 构建工具 | Vite |

### 后端

| 语言 | 职责 | 框架/工具 |
|------|------|-----------|
| Go | API 网关、高并发处理、Agent 编排层 | Gin |
| Python | AI/ML 逻辑、LLM 集成、数据库分析 | FastAPI |

### 🤖 Agent 核心

| 组件 | 技术选型 |
|------|----------|
| Agent 框架 | LangGraph |
| Prompt 模板 | LangChain |
| RAG 知识库 | LlamaIndex + 向量数据库 |

### 🗄️ 数据层

| 类型 | 技术选型 |
|------|----------|
| 关系型数据库 | MySQL、PostgreSQL |
| 缓存/键值 | Redis |
| 文档数据库 | MongoDB |
| 向量数据库 | ChromaDB / Milvus |

### 🧠 AI 能力

| 组件 | 技术 |
|------|------|
| LLM 接口 | OpenAI 标准格式（兼容 DeepSeek、通义千问等国产模型） |
| Embedding | OpenAI Embeddings 标准格式 |

---

## 📋 功能需求

### 1. 多数据库支持
- 支持 MySQL、PostgreSQL、Redis、MongoDB 等热门数据库
- 自动识别数据库类型并切换对应连接器
- 统一查询分析接口

### 2. AI 诊断能力（基于 LangGraph）
- 慢查询自动分析与归因
- EXPLAIN 执行计划智能解析
- 索引建议生成
- SQL 优化建议输出

### 3. RAG 知识库（用于自我迭代）
- 存储历史诊断结论与优化方案
- 基于向量相似度检索相似问题
- 支持诊断经验的积累与复用

### 4. OpenAI 标准接口
- 采用 OpenAI Chat Completion 标准格式
- 方便对接任意兼容模型（支持切换不同 LLM 提供商）
- 解耦模型依赖，便于后续扩展

### 5. WebSocket 实时通信
- 支持流式输出 Agent 思考过程
- 实时展示诊断进度与中间结果
- 提供良好的用户体验

### 6. 用户认证系统
- 用户注册与登录
- Token 鉴权机制
- 角色权限管理（可选）

### 7. API 文档
- 使用 Swagger/OpenAPI 规范
- 文档需同步更新到 README

---

## 🐳 部署要求

### Docker 部署
- 前后端分别独立部署
- 使用 Docker Compose 编排所有服务
- 支持环境变量配置（数据库连接、API Key 等）
- 提供生产级 nginx 配置

### 开发环境
- 目标系统：macOS
- Docker Desktop for Mac
- Go 1.21+ / Python 3.10+ / Node.js 18+

---

## 📁 项目结构要求

```
QueryDoctor/
├── frontend/          # React 前端项目
├── backend/           # Go 后端项目
├── agent/             # Python Agent 引擎
├── docs/              # 项目文档
├── docker/            # Docker 配置文件
└── README.md          # 项目说明文档
```

---

## 📝 README 要求

README 需包含：
- 项目介绍与功能说明
- 技术架构图
- 快速开始指南（Docker 部署）
- API 文档链接或摘要
- 开发指南
- 环境变量配置说明

---

## ✅ 开发优先级

### P0 - 核心功能
1. 数据库连接模块（MySQL/PostgreSQL）
2. LangGraph Agent 基础架构
3. 慢查询分析核心逻辑
4. 前端诊断界面

### P1 - 重要功能
5. 多数据库支持扩展（Redis/MongoDB）
6. RAG 知识库集成
7. WebSocket 实时通信
8. 用户认证系统

### P2 - 增强功能
9. API 文档完善
10. 更多诊断规则
11. 性能优化

---

## 🎯 输出要求

1. 提供完整的前后端代码实现
2. 包含 Dockerfile 和 Docker Compose 配置
3. 提供数据库初始化脚本
4. 更新项目 README.md
5. 编写关键模块的技术设计说明