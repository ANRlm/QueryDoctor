package handler

import (
	"net/http"

	"github.com/ANRlm/querydoctor/internal/metrics"
	"github.com/gin-gonic/gin"
)

// MetricsHandler provides metrics API endpoints
type MetricsHandler struct{}

// NewMetricsHandler creates a new MetricsHandler
func NewMetricsHandler() *MetricsHandler {
	return &MetricsHandler{}
}

// GetCacheStats handles GET /api/metrics/cache
func (h *MetricsHandler) GetCacheStats(c *gin.Context) {
	stats := metrics.GetCacheStats()
	c.JSON(http.StatusOK, gin.H{
		"cache": stats,
	})
}
