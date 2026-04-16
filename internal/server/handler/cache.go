package handler

import (
	"net/http"

	"github.com/ANRlm/querydoctor/internal/cache"
	"github.com/ANRlm/querydoctor/internal/metrics"
	"github.com/gin-gonic/gin"
)

// CacheHandler provides cache API endpoints
type CacheHandler struct {
	cache *cache.QueryCache
}

// NewCacheHandler creates a new CacheHandler
func NewCacheHandler(c *cache.QueryCache) *CacheHandler {
	return &CacheHandler{cache: c}
}

// GetCache handles GET /api/cache/:key
func (h *CacheHandler) GetCache(c *gin.Context) {
	timer := metrics.NewTimedOperation()
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	val, err := h.cache.Get(key)
	if err != nil {
		timer.RecordError()
		timer.Finish()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if val == nil {
		timer.RecordMiss()
		timer.Finish()
		c.JSON(http.StatusNotFound, gin.H{"error": "key not found"})
		return
	}

	timer.RecordHit()
	timer.Finish()
	c.JSON(http.StatusOK, gin.H{"key": key, "value": val})
}

// SetCache handles POST /api/cache/set
func (h *CacheHandler) SetCache(c *gin.Context) {
	var req struct {
		Key   string      `json:"key" binding:"required"`
		Value interface{} `json:"value" binding:"required"`
		TTL   int         `json:"ttl"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	timer := metrics.NewTimedOperation()
	if err := h.cache.Set(req.Key, req.Value, req.TTL); err != nil {
		timer.RecordError()
		timer.Finish()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	timer.Finish()
	c.JSON(http.StatusOK, gin.H{"status": "ok", "key": req.Key})
}

// DeleteCache handles DELETE /api/cache/:key
func (h *CacheHandler) DeleteCache(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "key is required"})
		return
	}

	timer := metrics.NewTimedOperation()
	if err := h.cache.Invalidate(key); err != nil {
		timer.RecordError()
		timer.Finish()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	timer.Finish()
	c.JSON(http.StatusOK, gin.H{"status": "deleted", "key": key})
}
