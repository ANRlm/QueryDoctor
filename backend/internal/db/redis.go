package db

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisClient is the global Redis client instance used across the application.
var RedisClient *redis.Client

// InitRedis initializes a Redis client with the given connection parameters and
// performs an immediate health check using Ping. Returns an error if initialization
// or the startup Ping fails.
func InitRedis(ctx context.Context, addr string, password string, db int) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		PoolSize:     50,
		MinIdleConns: 10,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	if err := RedisClient.Ping(ctx).Err(); err != nil {
		_ = RedisClient.Close()
		RedisClient = nil
		return err
	}

	return nil
}

// Ping checks connectivity to Redis using the provided context.
func Ping(ctx context.Context) error {
	if RedisClient == nil {
		return errors.New("redis client is not initialized")
	}
	return RedisClient.Ping(ctx).Err()
}
