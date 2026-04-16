# Draft: QueryDoctor P0 开发计划

## 项目基本信息
- **名称**: QueryDoctor - AI 数据库慢查询诊断 Agent
- **起点**: P0 核心功能
- **部署**: Docker 部署为主

## P0 核心功能范围

### 1. 数据库连接模块（MySQL/PostgreSQL）
- 数据库连接管理
- 连接池实现
- SQL 执行接口
- EXPLAIN 计划解析

### 2. LangGraph Agent 基础架构
- Agent 状态定义
- 节点定义（分析、诊断、建议）
- 边/流程定义
- 与 FastAPI 集成

### 3. 慢查询分析核心逻辑
- 查询分析节点
- 执行计划解析
- 索引建议生成
- SQL 优化建议

### 4. 前端诊断界面
- 诊断输入界面
- 结果展示
- 基础 UI 组件

## 架构决策
- [待研究] Go API 网关设计
- [待研究] Python Agent 服务设计
- [待研究] 前后端通信方式

## 外部依赖
- [待研究] LangGraph 最新 API
- [待研究] Gin 最佳实践
- [待研究] React + Ant Design 项目结构

## 技术决策（已确认）
- **Go-Python 通信**: Redis 消息队列
- **流式响应**: SSE (Server-Sent Events)
- **RAG**: P0 暂不包含

## 后端研究结论（Go Gin）
- **项目结构**: cmd/gateway/main.go, internal/{config,server,proxy,db,repo,service}
- **代理模式**: httputil.ReverseProxy 转发到 FastAPI
- **中间件**: JWT 认证、日志、错误处理、恢复
- **配置**: Viper 加载环境变量
- **数据库**: sqlx/database/sql 连接池，支持 MySQL/PostgreSQL

## 前端研究结论
- **项目结构**: Feature-based 组织，src/features/, src/components/, src/services/, src/store/
- **状态管理**: Zustand slices 模式，useDiagnosticsStore, useUIStore
- **API 层**: services/apiClient.ts 集中管理，typed endpoints
- **图表**: echarts-for-react 封装 EChartCard 组件
- **类型**: DTO 类型与 UI ViewModel 分离

## Agent 研究结论（LangGraph + FastAPI）
- **核心模式**: StateGraph (add_node/add_edge/compile/stream)
- **State 定义**: TypedDict with queries, analyses, diagnosis, suggestions
- **节点流**: collect -> analyze -> diagnose -> propose_actions -> END
- **FastAPI 集成**: StreamingResponse + graph.stream(version="v2") 输出 JSON lines
- **错误处理**: GraphRecursionError 捕获并转为 HTTP 429
- **关键文件**:
  - StateGraph: libs/langgraph/langgraph/graph/state.py
  - Errors: libs/langgraph/langgraph/errors.py
