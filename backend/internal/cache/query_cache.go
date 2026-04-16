package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

// QueryCache provides a Redis-backed query cache implementation.
// Values are JSON-serialized before storage; TTL uses seconds.
type QueryCache struct {
	client *redis.Client
	ctx    context.Context
}

// NewQueryCache creates a Redis-backed QueryCache.
// addr: Redis server address, e.g. "localhost:6379"
// password: Redis password (empty if none)
// db: Redis database number
func NewQueryCache(addr string, password string, db int) *QueryCache {
	opts := &redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	}
	return &QueryCache{
		client: redis.NewClient(opts),
		ctx:    context.Background(),
	}
}

// Set stores value with key, TTL uses ttl seconds.
// value will be JSON-serialized before storage.
func (q *QueryCache) Set(key string, value interface{}, ttl int) error {
	b, err := json.Marshal(value)
	if err != nil {
		return err
	}

	var expiration time.Duration
	if ttl > 0 {
		expiration = time.Duration(ttl) * time.Second
	} else {
		expiration = 0
	}

	return q.client.Set(q.ctx, key, b, expiration).Err()
}

// Get retrieves cached value by key.
// Returns (nil, nil) if key not found.
// Returns deserialized JSON as interface{} if possible, otherwise returns raw string.
func (q *QueryCache) Get(key string) (interface{}, error) {
	val, err := q.client.Get(q.ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var out interface{}
	if err := json.Unmarshal([]byte(val), &out); err != nil {
		return val, nil
	}
	return out, nil
}

// Invalidate removes cached key
func (q *QueryCache) Invalidate(key string) error {
	return q.client.Del(q.ctx, key).Err()
}

// Close closes the underlying Redis client connection
func (q *QueryCache) Close() error {
	return q.client.Close()
}

// Ping performs a health check on Redis connection
func (q *QueryCache) Ping() error {
	return q.client.Ping(q.ctx).Err()
}
