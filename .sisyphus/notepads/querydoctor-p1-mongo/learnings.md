# P1-MongoDB 学习笔记

## 实现完成 (2026-04-17)
- internal/db/mongo.go: InitMongo, GetMongoClient, PingMongo, GetCollection, ListDatabases, CloseMongo
- internal/server/middleware/mongo.go: Mongo() Gin 中间件
- internal/db/mongo_test.go: 4 个测试用例
- 依赖: go.mongodb.org/mongo-driver v1.17.9

## 技术决策
- Ping 改名为 PingMongo 避免与 redis.go 的 Ping 冲突
- 使用 sync.Once 确保 InitMongo 只执行一次
- 全局 mongoClient + GetMongoClient 访问模式

## 验证
- go build ./... 通过
- go test ./internal/db -count=1 通过
