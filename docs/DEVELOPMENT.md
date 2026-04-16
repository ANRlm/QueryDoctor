# QueryDoctor 开发指南

## 环境要求

- Go 1.21+
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

## 项目结构

```
QueryDoctor/
├── backend/              # Go 后端
│   ├── cmd/gateway/    # 入口
│   └── internal/        # 内部包
│       ├── auth/        # JWT 认证
│       ├── cache/       # 缓存
│       ├── config/      # 配置
│       ├── db/          # 数据库连接
│       ├── metrics/     # 监控
│       ├── proxy/       # 代理
│       ├── pubsub/      # Pub/Sub
│       └── server/      # HTTP 服务器
├── agent/               # Python Agent
│   ├── api/            # API 路由
│   ├── agent/          # Agent 逻辑
│   │   ├── nodes/      # LangGraph 节点
│   │   └── graph/      # 图定义
│   ├── db/             # 数据库客户端
│   └── rag/            # RAG 知识库
├── frontend/           # React 前端
└── docker/             # Docker 配置
```

## 开发环境设置

### 1. 克隆项目
```bash
git clone https://github.com/ANRlm/QueryDoctor.git
cd QueryDoctor
```

### 2. 启动依赖服务
```bash
docker compose up -d redis mysql postgres
```

### 3. Go 后端
```bash
cd backend
go mod tidy
go run ./cmd/gateway
```

### 4. Python Agent
```bash
cd agent
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### 5. 前端
```bash
cd frontend
npm install
npm run dev
```

## 添加新节点

### 1. 创建节点文件

`agent/agent/nodes/my_node.py`:

```python
from agent.state import AgentState

def my_node(state: AgentState) -> AgentState:
    # 处理逻辑
    return {**state, "key": "value"}
```

### 2. 注册节点

更新 `agent/agent/graph.py`:

```python
from agent.agent.nodes import my_node

builder.add_node("my_node", my_node)
builder.add_edge("previous_node", "my_node")
```

### 3. 导出节点

更新 `agent/agent/nodes/__init__.py`:

```python
from agent.agent.nodes.my_node import my_node
```

## 添加 API 端点

### Go Gateway

`backend/internal/server/handler/my_handler.go`:

```go
func MyHandler(c *gin.Context) {
    c.JSON(200, gin.H{"message": "ok"})
}
```

更新 `backend/internal/server/router.go` 添加路由。

### Python Agent

`agent/api/my_api.py`:

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/my-endpoint")
async def my_endpoint():
    return {"message": "ok"}
```

更新 `agent/api/routes.py` 注册路由。

## 测试

### Go 测试
```bash
cd backend
go test ./... -v
```

### Python 测试
```bash
cd agent
pytest
```

## Docker 构建

```bash
# 构建所有镜像
docker compose build

# 单独构建
docker build -t querydoctor-gateway ./backend
docker build -t querydoctor-agent ./agent
docker build -t querydoctor-frontend ./frontend
```

## 代码规范

### Go
- 使用 `gofmt` 格式化
- 遵循 `go vet` 规则
- 导入分组: 标准库 → 第三方 → 本地

### Python
- 使用 `ruff` 检查
- 遵循 PEP 8
- 类型提示

## 提交规范

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scopes: gateway, agent, frontend, docker, docs
```
