# P1-MongoDB 连接器计划

## TL;DR
- 目标：在 Go Gin 网关中增加 MongoDB 连接器支持，完成多数据库扩展
- 交付物：MongoDB 客户端封装、数据库连接、Collection 访问
- 工作量：小

## 背景与范围
- P1-Redis 已完成，模式：全局变量 + Init 函数
- MongoDB 连接器遵循相同模式，保持一致性
- 不改动现有 Redis/缓存架构

## 目标/工作项
- [x] 1) internal/db/mongo.go：初始化 MongoDB 客户端、Ping 健康检查、全局可用的 MongoClient
- [x] 2) MongoDB 中间件：Gin 中间件注入 MongoDB 客户端
- [x] 3) MongoDB 测试用例：单元测试
- [ ] 4) 文档更新：Notepad + README

## 技术决策
- 使用官方驱动：go.mongodb.org/mongo-driver
- 模式参考 internal/db/redis.go（全局 var + Init）
- 全局 MongoClient + InitMongo + GetCollection 辅助函数

## 关键路径
MongoDB 驱动初始化 → 配置集成 → 中间件 → 测试

## 依赖
- go.mongodb.org/mongo-driver
- docker-compose 中的 MongoDB 服务

## 验证策略
- go build ./... 通过
- go test ./internal/... 通过
- MongoDB Ping 返回 OK

## Notepad 路径
.sisyphus/notepads/querydoctor-p1-mongo/
