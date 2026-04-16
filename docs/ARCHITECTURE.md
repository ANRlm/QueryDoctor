# QueryDoctor 架构设计

## 系统概览

QueryDoctor 是一个智能数据库诊断 Agent，采用前后端分离架构。

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

## 组件

### 1. Frontend (React)

- React 18 + TypeScript
- Ant Design UI 组件
- Zustand 状态管理
- ECharts 图表可视化

**职责**: 用户界面、诊断请求展示

### 2. Go Gateway (Gin)

**路径**: `backend/`

- HTTP/WebSocket 服务器
- 路由和中间件
- Redis 缓存
- MongoDB 连接
- JWT 认证

**端点**:
- `/api/*` - REST API
- `/ws/*` - WebSocket
- `/health` - 健康检查

### 3. Python Agent (FastAPI)

**路径**: `agent/`

- LangGraph 工作流
- 数据库连接器
- RAG 知识库
- LLM 集成

**模块**:
- `agent/graph/` - LangGraph 定义
- `agent/nodes/` - 诊断节点
- `agent/rag/` - RAG 知识库
- `agent/db/` - 数据库客户端

## 诊断流程

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Collect │───▶│ Analyze │───▶│ Diagnose │───▶│ Suggest │───▶│ Format  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
   收集          分析          诊断           建议           输出
```

### 节点详解

1. **collect_node**: 收集查询信息，执行 EXPLAIN
2. **analyze_node**: 分析执行计划，检测性能问题
3. **diagnose_node**: 生成诊断结论
4. **suggest_node**: 生成优化建议
5. **format_node**: 格式化输出

## 数据流

### 诊断请求
1. 前端发送诊断请求到 Gateway
2. Gateway 转发到 Agent
3. Agent 执行 LangGraph 工作流
4. 结果流式返回前端

### 缓存
1. Gateway 检查 Redis 缓存
2. 缓存命中直接返回
3. 缓存未命中查询数据库

### RAG
1. 诊断结果存入向量数据库
2. 新诊断查询相似历史
3. 检索结果作为上下文

## 数据库连接

### MySQL
- 驱动: `pymysql`
- 端口: 3306
- 命令: `EXPLAIN`

### PostgreSQL
- 驱动: `psycopg2`
- 端口: 5432
- 命令: `EXPLAIN (FORMAT JSON)`

### Redis
- 驱动: `go-redis/v9` / `redis-py`
- 用途: 缓存、Pub/Sub、Streams

### MongoDB
- 驱动: `go.mongodb.org/mongo-driver`
- 用途: 文档存储

## 安全

### JWT 认证
- 算法: HS256
- 有效期: 24 小时
- 环境变量: `JWT_SECRET`

### CORS
- Gateway 处理跨域
- 允许来源配置

## 部署

### Docker Compose
- Gateway: 端口 8080
- Agent: 端口 8000
- Frontend: 端口 3000
- Nginx: 端口 80

### 环境变量
| 变量 | 说明 |
|------|------|
| REDIS_ADDR | Redis 地址 |
| JWT_SECRET | JWT 密钥 |
| OPENAI_API_KEY | OpenAI API Key |
