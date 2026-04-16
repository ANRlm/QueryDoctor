# 项目修复与完善计划

## TL;DR
- 目标：修复 Prompt.md 与实际实现的差距，完成剩余功能
- 工作量：大（需要多阶段执行）

## 问题清单

### 1. 项目结构不符
- **问题**：Go 代码在根目录，Prompt.md 要求 `backend/` 目录
- **修复**：将 Go 代码移动到 `backend/` 目录

### 2. 诊断逻辑占位符
- **问题**：`agent/agent/nodes/` 中节点为占位符，无真实实现
- **修复**：实现真实的慢查询分析逻辑

### 3. WebSocket 通信
- **问题**：只有 SSE，无 WebSocket
- **修复**：添加 WebSocket 支持

### 4. 用户认证
- **问题**：无 JWT 认证系统
- **修复**：实现 JWT 注册/登录/鉴权

### 5. API 文档
- **问题**：无 Swagger/OpenAPI 文档
- **修复**：添加 Swagger UI

### 6. docs/ 目录
- **问题**：`docs/` 目录不存在
- **修复**：创建技术文档

---

## 工作项

### Phase 1: 项目结构重构
- [ ] 创建 `backend/` 目录
- [ ] 移动 Go 代码到 `backend/internal/`
- [ ] 移动 `cmd/gateway` 到 `backend/cmd/gateway`
- [ ] 更新 import 路径
- [ ] 更新 docker-compose.yaml
- [ ] 更新 README.md

### Phase 2: 诊断核心实现
- [ ] `agent/agent/nodes/collect.py` - 收集查询信息
- [ ] `agent/agent/nodes/analyze.py` - 分析执行计划
- [ ] `agent/agent/nodes/diagnose.py` - 生成诊断结论
- [ ] `agent/agent/nodes/suggest.py` - 生成优化建议
- [ ] `agent/agent/nodes/format.py` - 格式化输出
- [ ] 数据库连接器完善（MySQL EXPLAIN, PostgreSQL EXPLAIN）

### Phase 3: WebSocket 支持
- [ ] Go Gateway: gorilla/websocket 支持
- [ ] Python Agent: WebSocket 端点
- [ ] 前端 WebSocket 集成

### Phase 4: JWT 认证
- [ ] `backend/internal/auth/jwt.go` - JWT 工具
- [ ] `backend/internal/auth/middleware.go` - 鉴权中间件
- [ ] `agent/api/auth.py` - 注册/登录端点
- [ ] 数据库用户表（MySQL/PostgreSQL）

### Phase 5: API 文档
- [ ] FastAPI Swagger UI
- [ ] Go Gateway Swagger 文档
- [ ] 创建 `docs/` 目录

---

## 关键路径
项目结构 → 诊断核心 → WebSocket → 认证 → 文档

## 依赖
- Go: github.com/gorilla/websocket
- Python: fastapi[all] (包含 Swagger)
- JWT: golang-jwt/jwt/v5

---

## Notepad 路径
.sisyphus/notepads/querydoctor-fix/
