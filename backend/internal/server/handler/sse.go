package handler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

var agentURL = "http://agent:8000"

func Diagnose(c *gin.Context) {
	var req struct {
		Query string `json:"query" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	proxyToAgent(c, req.Query, "postgresql")
}

func DiagnoseSSE(c *gin.Context) {
	query := c.Query("query")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query parameter required"})
		return
	}
	dbType := c.DefaultQuery("db_type", "postgresql")
	proxyToAgent(c, query, dbType)
}

func proxyToAgent(c *gin.Context, query, dbType string) {
	body, err := json.Marshal(map[string]string{"query": query, "db_type": dbType})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build request"})
		return
	}

	agentReq, err := http.NewRequest("POST", agentURL+"/diagnose", bytes.NewReader(body))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
		return
	}
	agentReq.Header.Set("Content-Type", "application/json")

	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Transfer-Encoding", "chunked")

	client := &http.Client{}
	resp, err := client.Do(agentReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to connect to agent"})
		return
	}
	defer resp.Body.Close()

	c.Status(resp.StatusCode)
	io.Copy(c.Writer, resp.Body)
	c.Writer.Flush()
}
