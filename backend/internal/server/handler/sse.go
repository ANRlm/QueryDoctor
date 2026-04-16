package handler

import (
	"io"
	"net/http"
	"strings"

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

	agentReq, err := http.NewRequest("POST", agentURL+"/diagnose", strings.NewReader(`{"query":"`+req.Query+`"}`))
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
