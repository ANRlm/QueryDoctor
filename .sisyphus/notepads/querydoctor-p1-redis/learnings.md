## Inherited Wisdom
- 计划将 Wave 1 与 Wave 2 的任务边界清晰化，避免并行冲突。
- Redis 客户端的 PoolSize/MinIdleConns 要与容器资源、并发量对齐，初期可从 20/5 启动。
- Pub/Sub 的设计需要考虑事件幂等性与消息重复处理。

## Risks / Mitigations
- 可能存在网络分区导致 Redis 连接丢失，建议实现重连和健康检查。
- 生产环境下需对 Redis 的鉴权和 TLS 进行配置。

## Decision Log
- 选择 go-redis/v9 的客户端库用于 Redis 连接。
- 将缓存端点暴露为 REST API，并通过 Gin 中间件注入 Redis 客户端。

## Wave 1 Completion (2026-04-17)
- T1 (internal/db/redis.go): Created - InitRedis, Ping, global RedisClient
- T2 (internal/cache/query_cache.go): Created - Set/Get/Invalidate with TTL seconds
- T3 (internal/pubsub/diagnostic_events.go): Created - PublishDiagnosticEvent/SubscribeDiagnosticEvents
- Using go-redis/v9 with Redis Streams fallback via REDIS_USE_STREAMS env

## LSP Issues
- Some LSP errors due to go.sum missing entries (not critical for build)
- Need to run go mod tidy to fix dependencies

## Test Completion (2026-04-17)
- Created 4 test files:
  - internal/db/redis_test.go: InitRedis, Ping, NotInitialized tests
  - internal/cache/query_cache_test.go: Set/Get/Invalidate, TTL, Ping tests
  - internal/pubsub/diagnostic_events_test.go: Publish/Subscribe, EmptyTopic tests
  - internal/server/handler/cache_test.go: GET/POST/DELETE cache endpoints
- All 17 tests pass (miniredis for Redis mocking)
- Dependencies added: github.com/alicebob/miniredis/v2

## Metrics Implementation (2026-04-17)
- Created internal/metrics/cache_metrics.go: CacheMetrics struct with atomic counters
- Tracks: hits, misses, errors, total, hit_rate_percent, avg_latency_ms
- TimedCacheOperation helper for tracking operation latency
- GET /api/metrics/cache endpoint via MetricsHandler
- Integrated metrics recording into cache handler (GetCache, SetCache, DeleteCache)
