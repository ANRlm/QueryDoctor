## P1: Redis 连接器计划

### TL;DR
- 目标：在现有 P0 基础上实现 Redis 连接器，扩展缓存能力并支持 Pub/Sub 事件流。
- 交付物：Redis 客户端封装、查询缓存、Pub/Sub 事件、简单 API 端点。
- 并发执行：两波（Wave 1/Wave 2），独立任务可并行。
- 关键路径：Go Redis 客户端初始化 -> 缓存 API -> Pub/Sub -> 集成测试

### 背景与范围
- P0 已完成 docker 验证与基础服务；P1 目标是在 Go Gin 网关中增加 Redis 支撑。
- 使用 go-redis/v9 作为主客户端，考虑 Redis Pub/Sub 作为诊断事件的通道。
- 计划中不改动现有 SSE/诊断流程，专注于缓存与事件驱动的扩展。

### 目标/工作项
- [x] 1) internal/db/redis.go：初始化 Redis 客户端、Ping 健康检查、全局可用的 RedisClient
- [x] 2) internal/cache/query_cache.go：实现查询缓存的 Set/Get/Invalidate，支持 TTL
- [x] 3) internal/pubsub/diagnostic_events.go：实现 PublishDiagnosticEvent / SubscribeDiagnosticEvents
- [x] 4) internal/server/middleware/redis.go：将 Redis 客户端注入 Gin 上下文 (c.Get("redis")) 的中间件
- [x] 5) API 路由：GET/POST /api/cache/* 端点（缓存管理）
- [x] 6) 测试用例：单元测试缓存、Pub/Sub、集成测试（通过 docker-compose 环境）
- [x] 7) 监控与观测：记录命中率、错误率、延迟
- [x] 8) 文档与记事本更新：更新 Notepad/Readme 与 Evidence 日志

### 交付标准
- [x] Redis 客户端初始化可用，Ping 返回 OK
- [x] 缓存 Set/Get 正确工作，TTL 生效
- [x] Pub/Sub 可发布/订阅诊断事件
- [x] API 缓存端点返回正确响应
- [x] 集成测试通过，容器环境稳定

### 验证策略
- 手动验证：在 Docker Compose 启动的 Redis 实例上执行 Ping/Set/Get
- 自动测试：Go 单元测试覆盖 Redis 初始化、缓存逻辑、Pub/Sub 流
- 集成测试：通过网关访问缓存端点及 Pub/Sub 端点

### 依赖关系
- 计划中引用现有 Redis 服务：docker-compose.yaml 已包含 Redis
- 需要 go-redis/v9 作为客户端依赖

### Notepad/证据路径
- Notepad: .sisyphus/notepads/querydoctor-p1-redis/
- Evidence 路径：.sisyphus/evidence/p1-redis-*.log

### 备注
- 如需分支/并行执行策略，请在现有工作流中明确划分 Wave 1 与 Wave 2 的任务边界。
