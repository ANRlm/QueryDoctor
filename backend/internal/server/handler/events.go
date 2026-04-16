package handler

import (
	"net/http"

	"github.com/ANRlm/querydoctor/backend/internal/pubsub"
	"github.com/gin-gonic/gin"
)

// PublishEvent handles POST /api/events/publish
func PublishEvent(c *gin.Context) {
	var req struct {
		Topic   string      `json:"topic" binding:"required"`
		Payload interface{} `json:"payload" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := pubsub.PublishDiagnosticEvent(req.Topic, req.Payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "published", "topic": req.Topic})
}
