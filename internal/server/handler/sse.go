package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

var redisClient *redis.Client

func InitRedis(addr string) {
	redisClient = redis.NewClient(&redis.Options{
		Addr: addr,
	})
}

func Diagnose(c *gin.Context) {
	var req struct {
		Query string `json:"query"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	taskID := fmt.Sprintf("diagnose:%d", time.Now().UnixNano())

	if redisClient != nil {
		redisClient.XAdd(c.Request.Context(), &redis.XAddArgs{
			Stream: "diagnose:tasks",
			Values: map[string]interface{}{
				"task_id": taskID,
				"query":   req.Query,
			},
		})
	}

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "streaming not supported"})
		return
	}

	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	eventID := 0

	sendSSE := func(eventType string, data interface{}) {
		eventID++
		response := map[string]interface{}{
			"id":      eventID,
			"type":    eventType,
			"task_id": taskID,
			"data":    data,
		}
		jsonData, _ := json.Marshal(response)
		fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", eventType, jsonData)
		flusher.Flush()
	}

	sendSSE("ping", map[string]string{"status": "connected"})

	go func() {
		for {
			select {
			case <-c.Request.Context().Done():
				return
			case <-ticker.C:
				sendSSE("ping", map[string]string{"status": "alive"})
			}
		}
	}()

	sendSSE("diagnosing", map[string]string{"query": req.Query})
	time.Sleep(100 * time.Millisecond)

	sendSSE("analyzing", map[string]string{"stage": "analyze"})
	time.Sleep(100 * time.Millisecond)

	sendSSE("suggesting", map[string]string{"stage": "suggest"})
	time.Sleep(100 * time.Millisecond)

	sendSSE("result", map[string]interface{}{
		"diagnosis":   "Placeholder diagnosis - full implementation in T7",
		"suggestions": []string{"Consider adding an index on column 'id'"},
	})

	sendSSE("done", map[string]string{"status": "complete"})
}

func TestDBConnection(c *gin.Context) {
	var req struct {
		Type     string `json:"type"`
		Host     string `json:"host"`
		Port     int    `json:"port"`
		User     string `json:"user"`
		Password string `json:"password"`
		Database string `json:"database"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":   "connected",
		"type":     req.Type,
		"database": req.Database,
	})
}
