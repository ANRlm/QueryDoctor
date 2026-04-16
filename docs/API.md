# QueryDoctor API 文档

## 概述

QueryDoctor 提供 RESTful API 和 WebSocket 接口，支持数据库诊断、缓存管理、用户认证等功能。

**基础 URL**:
- Gateway: `http://localhost:8080`
- Agent: `http://localhost:8000`

---

## 认证

除公开端点外，所有 API 需要 JWT Token 认证。

### 请求头
```
Authorization: Bearer <token>
```

### 错误响应
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

## 公开端点

### 健康检查

**GET** `/health`

检查服务健康状态。

**响应**
```json
{
  "status": "ok"
}
```

---

### 用户注册

**POST** `/api/auth/register`

**请求体**
```json
{
  "username": "string",
  "password": "string",
  "email": "string (optional)"
}
```

**响应 (201)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "string",
  "user_id": "string"
}
```

---

### 用户登录

**POST** `/api/auth/login`

**请求体**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应 (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "string",
  "user_id": "string"
}
```

---

## 认证端点 (需 Token)

### 获取当前用户

**GET** `/api/auth/me`

**响应 (200)**
```json
{
  "user_id": "string",
  "username": "string"
}
```

---

### 刷新 Token

**POST** `/api/auth/refresh`

**请求头**
```
Authorization: Bearer <token>
```

**响应 (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 诊断 API (需 Token)

### 诊断查询 (SSE)

**POST** `/api/diagnose`

流式返回诊断结果。

**请求体**
```json
{
  "query": "SELECT * FROM users WHERE id = 1",
  "db_type": "postgresql"
}
```

**响应** (text/event-stream)
```
data: {"analyses": ["分析结果"]}

data: {"diagnosis": "诊断结论"}

data: {"suggestions": ["优化建议"]}

data: {"type": "done"}
```

---

## 缓存 API (需 Token)

### 获取缓存

**GET** `/api/cache/:key`

**响应 (200)**
```json
{
  "key": "string",
  "value": "any"
}
```

**响应 (404)**
```json
{
  "error": "key not found"
}
```

---

### 设置缓存

**POST** `/api/cache/set`

**请求体**
```json
{
  "key": "string",
  "value": "any",
  "ttl": 60
}
```

**响应 (200)**
```json
{
  "status": "ok",
  "key": "string"
}
```

---

### 删除缓存

**DELETE** `/api/cache/:key`

**响应 (200)**
```json
{
  "status": "deleted",
  "key": "string"
}
```

---

## 监控 API (需 Token)

### 缓存统计

**GET** `/api/metrics/cache`

**响应 (200)**
```json
{
  "cache": {
    "hits": 100,
    "misses": 20,
    "errors": 2,
    "total": 120,
    "hit_rate_percent": 83.33,
    "avg_latency_ms": 1.5
  }
}
```

---

## WebSocket API

### 通用 WebSocket

**GET** `/ws`

基本 WebSocket 端点。

**发送**
```json
{"message": "hello"}
```

**接收**
```json
Received: hello
```

---

### Agent WebSocket

**GET** `/ws/agent`

Agent 专用 WebSocket，支持诊断请求。

**发送**
```json
{
  "type": "diagnose",
  "query": "SELECT * FROM users"
}
```

**接收**
```json
{
  "type": "diagnose_result",
  "data": {
    "queries": ["SELECT * FROM users"],
    "analyses": ["分析结果"],
    "diagnosis": "诊断结论",
    "suggestions": ["优化建议"]
  }
}
```

---

## 错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 无效 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## Agent API (Python)

Agent 服务提供额外的 RAG 功能。

### RAG 索引

**POST** `/rag/index`

**请求体**
```json
{
  "records": [
    {
      "query": "慢查询问题",
      "diagnosis": "缺少索引",
      "suggestions": ["添加索引"],
      "timestamp": "2024-01-01"
    }
  ]
}
```

**响应**
```json
{
  "indexed_count": 1,
  "collection_count": 10
}
```

---

### RAG 查询

**POST** `/rag/query`

**请求体**
```json
{
  "query": "查询慢",
  "top_k": 5,
  "similarity_threshold": 0.7
}
```

**响应**
```json
{
  "results": [
    {
      "query": "查询慢",
      "diagnosis": "缺少索引",
      "suggestions": ["添加索引"],
      "score": 0.95
    }
  ],
  "context": "参考 1 (相似度: 0.95)..."
}
```

---

### RAG 统计

**GET** `/rag/stats`

**响应**
```json
{
  "collection_count": 10,
  "collection_name": "diagnostics"
}
```
