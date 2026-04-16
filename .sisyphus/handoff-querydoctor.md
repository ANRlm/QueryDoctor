# QueryDoctor Handoff Document

**创建时间**: 2026-04-17
**会话类型**: 恢复检查点 (restore checkpointed session)
**远程仓库**: https://github.com/ANRlm/QueryDoctor

---

## 1. 项目概述

**QueryDoctor** - AI 数据库慢查询诊断 Agent

### 核心功能
- 多数据库支持（MySQL、PostgreSQL、Redis、MongoDB）
- AI 诊断能力（基于 LangGraph）
- 慢查询自动分析与归因
- EXPLAIN 执行计划智能解析
- 索引建议生成
- SQL 优化建议输出
- SSE 实时流式响应
- WebSocket 实时通信
- RAG 知识库（诊断经验积累与复用）
- JWT 用户认证

### 技术架构
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

---

## 2. 项目结构

```
QueryDoctor/
├── backend/                    # Go 后端项目 (主代码)
│   ├── cmd/gateway/          # 网关入口
│   │   └── main.go
│   └── internal/             # 内部包
│       ├── auth/             # JWT 认证
│       ├── cache/            # Redis 缓存
│       ├── config/           # 配置
│       ├── db/               # 数据库连接 (MySQL, PostgreSQL, Redis, MongoDB)
│       ├── metrics/          # 指标
│       ├── proxy/            # HTTP 代理
│       ├── pubsub/           # Redis Streams
│       └── server/           # HTTP 服务器
│           ├── handler/      # HTTP 处理器
│           └── middleware/   # 中间件
├── agent/                     # Python Agent 引擎
│   ├── api/                  # FastAPI 路由
│   │   ├── auth.py          # 认证端点
│   │   ├── rag_api.py       # RAG 端点
│   │   ├── routes.py        # 路由
│   │   └── websocket.py     # WebSocket
│   ├── agent/               # LangGraph Agent
│   │   ├── graph.py         # 图定义 (关键修复: import agent.state 而非 agent.agent.state)
│   │   ├── state.py         # 状态定义
│   │   └── nodes/           # 节点实现
│   │       ├── analyze.py
│   │       ├── collect.py
│   │       ├── diagnose.py
│   │       ├── format.py
│   │       └── suggest.py
│   ├── db/                   # 数据库连接
│   │   ├── connector.py
│   │   ├── mysql_client.py
│   │   └── postgres_client.py
│   ├── rag/                  # RAG 实现
│   │   ├── config.py
│   │   ├── indexer.py
│   │   ├── models.py
│   │   └── retriever.py
│   ├── config.py
│   ├── main.py
│   ├── pyproject.toml
│   └── requirements.txt
├── frontend/                  # React 前端
├── docs/                      # 文档
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
├── scripts/                   # 数据库初始化脚本
│   ├── init_mysql.sql
│   └── init_postgres.sql
├── docker/                    # Docker 配置
├── docker-compose.yaml
├── Prompt.md                   # 项目需求文档
└── README.md
```

---

## 3. 已知问题

### LSP 警告（可能不影响构建）
```
router.go:27:23 - undefined: handler.NewWSHandler
router.go:28:25 - undefined: handler.NewAuthHandler
```
**状态**: 构造函数存在于 `websocket.go:22` 和 `auth.go:29`，LSP 警告可能是临时问题

### 根目录有重复 Go 文件
- `/Users/cnhyk/QueryDoctor/go.mod` - 应删除（正确的在 backend/）
- `/Users/cnhyk/QueryDoctor/go.sum` - 应删除
- `/Users/cnhyk/QueryDoctor/internal/` - 应删除
- `/Users/cnhyk/QueryDoctor/cmd/` - 应删除

### Git 仓库状态
- 刚初始化，没有 commit
- 远程已配置: https://github.com/ANRlm/QueryDoctor
- 需要 force push

---

## 4. 已验证正常的功能

### Python Agent Imports ✅
```bash
cd /Users/cnhyk/QueryDoctor/agent && python -c "from agent.graph import compiled_graph; print('OK')"
# 输出: OK
```

### Go Backend 构建（之前验证）
```bash
cd /Users/cnhyk/QueryDoctor/backend && go build ./...
# 成功
```

---

## 5. 下一步任务清单

### Task 1: 清理和准备 Git
1. 删除根目录重复的 Go 文件（go.mod, go.sum, internal/, cmd/）
2. 创建 .gitignore
3. 配置 git user (email: nai.ying.cnhyk@gmail.com, name: cnhyk)
4. Stage 正确文件
5. 创建初始 commit

### Task 2: Force Push 到 GitHub
```bash
git push --force-with-lease origin main
```

### Task 3: 运行功能测试
1. Go 构建: `cd backend && go build ./...`
2. Go 测试: `cd backend && go test ./...`
3. Python import: `cd agent && python -c "from agent.graph import compiled_graph; print('OK')"`
4. Python 语法: `cd agent && python -m py_compile agent/graph.py agent/state.py`

### Task 4: 修复发现的问题（如有）
- 分析测试失败原因
- 修复代码
- 重新测试
- Commit 和 push

### Task 5: 更新 README
- 确保 README 准确反映项目结构
- 更新部署说明
- Push 到 GitHub

---

## 6. 关键文件内容

### agent/agent/graph.py (关键 import 修复)
```python
# 正确写法
from agent.state import DiagnosisState

# 错误写法（之前的）
from agent.agent.state import DiagnosisState
```

### backend/internal/server/router.go
- 使用 `handler.NewWSHandler()` 和 `handler.NewAuthHandler()`
- 这些构造函数存在于对应的 handler 文件中

---

## 7. Git 配置

```bash
git config user.email "nai.ying.cnhyk@gmail.com"
git config user.name "cnhyk"
git remote add origin https://github.com/ANRlm/QueryDoctor.git
```

---

## 8. 联系方式

- **GitHub**: ANRlm
- **Email**: nai.ying.cnhyk@gmail.com

---

## 9. 执行命令汇总

```bash
# 1. 清理重复 Go 文件
rm -f /Users/cnhyk/QueryDoctor/go.mod
rm -f /Users/cnhyk/QueryDoctor/go.sum
rm -rf /Users/cnhyk/QueryDoctor/internal
rm -rf /Users/cnhyk/QueryDoctor/cmd

# 2. 创建 .gitignore
cat > /Users/cnhyk/QueryDoctor/.gitignore << 'EOF'
__pycache__/
*.py[cod]
*.pyc
.pytest_cache/
.venv/
vendor/
*.exe
*.test
.idea/
.vscode/
.ruff_cache/
.env
.DS_Store
EOF

# 3. Git 配置和提交
cd /Users/cnhyk/QueryDoctor
git config user.email "nai.ying.cnhyk@gmail.com"
git config user.name "cnhyk"
git add backend/ agent/ frontend/ docs/ scripts/ docker/ Prompt.md README.md docker-compose.yaml .gitignore
git commit -m "feat: complete QueryDoctor P0-P2 implementation"
git push --force-with-lease origin main

# 4. 功能测试
cd /Users/cnhyk/QueryDoctor/backend && go build ./... && go test ./...
cd /Users/cnhyk/QueryDoctor/agent && python -c "from agent.graph import compiled_graph; print('OK')"
```

---

**Handoff 完成时间**: 2026-04-17
**计划文件**: `.sisyphus/plans/querydoctor-final-push-test.md`
