# QueryDoctor

AI 数据库慢查询诊断 Agent

## 项目介绍

QueryDoctor 是一个智能数据库诊断 Agent，能够自动分析慢查询、生成优化建议、支持多种数据库。

## 核心功能

- 多数据库支持（MySQL、PostgreSQL、MongoDB、Redis）
- AI 诊断能力（基于 LangGraph）
- 慢查询自动分析与归因
- EXPLAIN 执行计划智能解析
- 索引建议生成
- SQL 优化建议输出
- SSE 实时流式响应
- WebSocket 实时通信
- RAG 知识库（诊断经验积累与复用）
- JWT 用户认证

## 技术架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│  Go Gateway │────▶│Python Agent │
│   (React)   │◀────│    (Gin)    │◀────│  (FastAPI)  │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Redis    │────▶│  Databases  │
                    │  (Streams) │     │(MySQL/PG)   │
                    └─────────────┘     └─────────────┘
```

## 项目结构

```
QueryDoctor/
├── backend/           # Go 后端项目
│   ├── cmd/gateway/ # 网关入口
│   └── internal/     # 内部包
├── agent/            # Python Agent 引擎
│   ├── api/         # API 路由
│   ├── agent/       # LangGraph Agent
│   └── rag/         # RAG 知识库
├── frontend/         # React 前端项目
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── features/   # 功能页面
│   │   ├── services/   # API 客户端
│   │   └── store/      # 状态管理
│   └── ...
├── docs/             # 项目文档
├── scripts/          # 数据库初始化脚本
├── docker/           # Docker 配置
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+
- Go 1.21+
- Python 3.10+
- Redis

### 本地开发

```bash
# 安装前端依赖
cd frontend && npm install

# 启动前端开发服务器
npm run dev

# 新终端窗口 - 启动后端
cd backend && go run ./cmd/gateway

# 新终端窗口 - 启动 Agent
cd agent && python -m uvicorn main:app --reload
```

访问 http://localhost:3000

### Docker 部署

```bash
docker compose up -d
```

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Framer Motion |
| API 网关 | Go + Gin |
| Agent 引擎 | Python + FastAPI + LangGraph |
| 消息队列 | Redis Streams |
| 数据库 | MySQL, PostgreSQL, MongoDB |
| 向量存储 | ChromaDB |
| 认证 | JWT |

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| REDIS_ADDR | Redis 地址 | redis:6379 |
| BACKEND_URL | Agent 服务地址 | http://agent:8000 |
| OPENAI_API_KEY | OpenAI API Key | - |
| JWT_SECRET | JWT 密钥 | 默认值（生产需修改） |

## API 端点

### Gateway (Go)
- `GET /health` - 健康检查
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/diagnose` - 诊断查询（SSE 流式响应）
- `GET /api/cache/:key` - 获取缓存
- `POST /api/cache/set` - 设置缓存
- `DELETE /api/cache/:key` - 删除缓存
- `GET /api/metrics/cache` - 缓存统计
- `GET /ws` - WebSocket 端点
- `GET /ws/agent` - Agent WebSocket 端点

### Agent (Python)
- `GET /health` - 健康检查
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/me` - 获取当前用户
- `POST /diagnose` - 诊断查询
- `WS /ws` - WebSocket 端点
- `WS /ws/agent` - Agent WebSocket 端点
- `POST /rag/index` - 索引诊断记录
- `POST /rag/query` - 查询相似诊断
- `GET /rag/stats` - RAG 统计

## 许可证

MIT
