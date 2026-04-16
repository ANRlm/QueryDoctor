# Draft: QueryDoctor P1 开发计划

## 项目基本信息
- **名称**: QueryDoctor P1
- **起点**: P0 已完成（docker compose 验证成功）
- **目标**: 重要功能实现

## P1 功能范围

### 1. 多数据库支持扩展（Redis/MongoDB）
- Redis 连接器（缓存、消息队列）
- MongoDB 连接器（文档存储）
- 统一查询接口

### 2. RAG 知识库集成
- LlamaIndex 集成
- 向量数据库（ChromaDB/Milvus）
- 诊断知识存储和检索
- 相似问题检索

### 3. 用户认证系统
- 用户注册/登录
- JWT Token 鉴权
- 密码加密（bcrypt）
- Token 刷新机制

### 4. WebSocket 实时通信（可选）
- 双向通信支持
- 实时诊断进度

## 技术决策（基于研究）

### Redis/MongoDB
- **Redis 客户端**: github.com/redis/go-redis/v9（现代 API、连接池、context 支持）
- **MongoDB 驱动**: go.mongodb.org/mongo-driver/mongo（官方驱动）
- **集成模式**: Gin middleware 注入 AppCtx，handler 通过 c.Get("appCtx") 获取

### RAG
- **索引**: LlamaIndex（latest stable）
- **向量库**: Milvus（生产规模）/ Chroma（快速原型）
- **持久化**: InMemorySaver（开发）/ PostgresSaver 或 RedisStore（生产）
- **集成**: LangGraph 节点调用 LlamaIndex QueryEngine

### JWT Auth
- **库**: golang-jwt/jwt（HS256）
- **密码**: bcrypt（cost 12）
- **Access Token**: 15-30 分钟过期
- **Refresh Token**: 7-14 天，滚动刷新，存储在 DB
- **安全**: Refresh Token 用 HttpOnly+Secure Cookie，Access Token 用 Authorization Header

## P1 任务估算
| 功能 | 复杂度 | 依赖 |
|------|--------|------|
| Redis 连接器 | 低 | P0 |
| MongoDB 连接器 | 低 | P0 |
| RAG 知识库 | 高 | LangGraph 基础 |
| 用户认证 | 中 | P0 |

## 参考资料
- P0 实现: .sisyphus/plans/querydoctor-p0.md
- 项目结构: /Users/cnhyk/QueryDoctor/
