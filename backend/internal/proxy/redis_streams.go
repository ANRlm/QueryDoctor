package proxy

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	StreamTasks   = "diagnose:tasks"
	StreamResults = "diagnose:results"
	ConsumerGroup = "diagnose-group"
)

type TaskMessage struct {
	TaskID string `json:"task_id"`
	Query  string `json:"query"`
}

type ResultMessage struct {
	TaskID      string   `json:"task_id"`
	Diagnosis   string   `json:"diagnosis"`
	Suggestions []string `json:"suggestions"`
	Status      string   `json:"status"`
}

type RedisStreams struct {
	client *redis.Client
}

func NewRedisStreams(addr string) *RedisStreams {
	return &RedisStreams{
		client: redis.NewClient(&redis.Options{
			Addr: addr,
		}),
	}
}

func (r *RedisStreams) PublishTask(ctx context.Context, task TaskMessage) (string, error) {
	data := map[string]interface{}{
		"task_id": task.TaskID,
		"query":   task.Query,
	}
	return r.client.XAdd(ctx, &redis.XAddArgs{
		Stream: StreamTasks,
		Values: data,
	}).Result()
}

func (r *RedisStreams) CreateConsumerGroup(ctx context.Context) error {
	return r.client.XGroupCreateMkStream(ctx, StreamTasks, ConsumerGroup, "0").Err()
}

func (r *RedisStreams) ReadTask(ctx context.Context, consumerName string, count int64) ([]TaskMessage, error) {
	streams, err := r.client.XReadGroup(ctx, &redis.XReadGroupArgs{
		Group:    ConsumerGroup,
		Consumer: consumerName,
		Streams:  []string{StreamTasks, ">"},
		Count:    count,
		Block:    time.Second,
	}).Result()
	if err != nil {
		return nil, err
	}

	var tasks []TaskMessage
	for _, stream := range streams {
		for _, msg := range stream.Messages {
			var task TaskMessage
			if err := json.Unmarshal([]byte(msg.Values["task_id"].(string)), &task); err == nil {
				task.TaskID = msg.Values["task_id"].(string)
				task.Query = msg.Values["query"].(string)
				tasks = append(tasks, task)
			}
		}
	}
	return tasks, nil
}

func (r *RedisStreams) PublishResult(ctx context.Context, result ResultMessage) error {
	data := map[string]interface{}{
		"task_id":     result.TaskID,
		"diagnosis":   result.Diagnosis,
		"suggestions": fmt.Sprintf("%v", result.Suggestions),
		"status":      result.Status,
	}
	_, err := r.client.XAdd(ctx, &redis.XAddArgs{
		Stream: StreamResults,
		Values: data,
	}).Result()
	return err
}

func (r *RedisStreams) AcknowledgeTask(ctx context.Context, messageID string) error {
	return r.client.XAck(ctx, StreamTasks, ConsumerGroup, messageID).Err()
}
