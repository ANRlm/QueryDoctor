package pubsub

import (
	"context"
	"encoding/json"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	redisClient *redis.Client
	initOnce    sync.Once
	useStreams  bool
)

func initConfig() {
	sw := os.Getenv("REDIS_USE_STREAMS")
	switchVal := strings.ToLower(strings.TrimSpace(sw))
	useStreams = switchVal == "true" || switchVal == "1" || switchVal == "yes"

	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}
	pwd := os.Getenv("REDIS_PASSWORD")

	db := 0
	if v := os.Getenv("REDIS_DB"); v != "" {
		if d, err := strconv.Atoi(v); err == nil {
			db = d
		}
	}

	redisClient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: pwd,
		DB:       db,
	})

	_ = redisClient.Ping(context.Background()).Err()
}

func getClient() *redis.Client {
	initOnce.Do(initConfig)
	return redisClient
}

// PublishDiagnosticEvent publishes a diagnostic event to the specified topic.
// Uses Pub/Sub by default, or Redis Streams if REDIS_USE_STREAMS=true.
// Topics: diagnostics:start, diagnostics:complete, diagnostics:error
func PublishDiagnosticEvent(topic string, payload interface{}) error {
	client := getClient()

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	if useStreams {
		_, err = client.XAdd(context.Background(), &redis.XAddArgs{
			Stream: "diagnostics-stream",
			ID:     "*",
			Values: map[string]interface{}{
				"topic":   topic,
				"payload": string(payloadBytes),
				"ts":      time.Now().UnixNano(),
			},
		}).Result()
		return err
	}

	return client.Publish(context.Background(), topic, payloadBytes).Err()
}

// SubscribeDiagnosticEvents subscribes to diagnostic events for the specified topic.
// Returns a read-only channel for receiving payloads.
// Topics: diagnostics:start, diagnostics:complete, diagnostics:error
func SubscribeDiagnosticEvents(topic string) (<-chan interface{}, error) {
	client := getClient()
	out := make(chan interface{}, 16)

	if useStreams {
		go func() {
			defer close(out)
			lastID := "0-0"
			for {
				res, err := client.XRead(context.Background(), &redis.XReadArgs{
					Streams: []string{"diagnostics-stream", lastID},
					Block:   5 * time.Second,
					Count:   0,
				}).Result()
				if err != nil {
					time.Sleep(100 * time.Millisecond)
					continue
				}

				for _, stream := range res {
					for _, msg := range stream.Messages {
						lastID = msg.ID
						if t, ok := msg.Values["topic"].(string); ok && t == topic {
							if payloadStr, ok := msg.Values["payload"].(string); ok {
								var payload interface{}
								if err := json.Unmarshal([]byte(payloadStr), &payload); err != nil {
									out <- payloadStr
								} else {
									out <- payload
								}
							} else {
								out <- nil
							}
						}
					}
				}
			}
		}()
		return out, nil
	}

	pubsub := client.Subscribe(context.Background(), topic)
	ch := pubsub.Channel()

	go func() {
		defer close(out)
		for msg := range ch {
			var payload interface{}
			if err := json.Unmarshal([]byte(msg.Payload), &payload); err != nil {
				out <- msg.Payload
			} else {
				out <- payload
			}
		}
	}()

	return out, nil
}
