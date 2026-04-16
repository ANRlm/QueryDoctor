package metrics

import (
	"sync"
	"sync/atomic"
	"time"
)

// CacheMetrics tracks cache operation metrics
type CacheMetrics struct {
	hits       atomic.Int64
	misses     atomic.Int64
	errors     atomic.Int64
	latencySum atomic.Int64 // nanoseconds

	mu sync.RWMutex
}

// Global cache metrics instance
var cacheMetrics = &CacheMetrics{}

// RecordHit records a cache hit
func RecordHit() {
	cacheMetrics.hits.Add(1)
}

// RecordMiss records a cache miss
func RecordMiss() {
	cacheMetrics.misses.Add(1)
}

// RecordError records a cache error
func RecordError() {
	cacheMetrics.errors.Add(1)
}

// RecordLatency records cache operation latency in milliseconds
func RecordLatency(ms float64) {
	cacheMetrics.latencySum.Add(int64(ms * 1e6))
}

// GetCacheStats returns current cache statistics
func GetCacheStats() CacheStats {
	hits := cacheMetrics.hits.Load()
	misses := cacheMetrics.misses.Load()
	errors := cacheMetrics.errors.Load()
	latencyNs := cacheMetrics.latencySum.Load()
	total := hits + misses

	var hitRate float64
	if total > 0 {
		hitRate = float64(hits) / float64(total) * 100
	}

	var avgLatencyMs float64
	if total > 0 {
		avgLatencyMs = float64(latencyNs) / float64(total) / 1e6
	}

	return CacheStats{
		Hits:         hits,
		Misses:       misses,
		Errors:       errors,
		Total:        total,
		HitRate:      hitRate,
		AvgLatencyMs: avgLatencyMs,
	}
}

// ResetCacheStats resets all cache metrics (for testing)
func ResetCacheStats() {
	cacheMetrics.hits.Store(0)
	cacheMetrics.misses.Store(0)
	cacheMetrics.errors.Store(0)
	cacheMetrics.latencySum.Store(0)
}

// CacheStats represents cache statistics
type CacheStats struct {
	Hits         int64   `json:"hits"`
	Misses       int64   `json:"misses"`
	Errors       int64   `json:"errors"`
	Total        int64   `json:"total"`
	HitRate      float64 `json:"hit_rate_percent"`
	AvgLatencyMs float64 `json:"avg_latency_ms"`
}

// TimedCacheOperation wraps a cache operation with timing
type TimedCacheOperation struct {
	startTime time.Time
}

func NewTimedOperation() *TimedCacheOperation {
	return &TimedCacheOperation{startTime: time.Now()}
}

func (t *TimedCacheOperation) RecordMiss() {
	RecordMiss()
}

func (t *TimedCacheOperation) RecordHit() {
	RecordHit()
}

func (t *TimedCacheOperation) RecordError() {
	RecordError()
}

func (t *TimedCacheOperation) Finish() {
	ms := time.Since(t.startTime).Seconds() * 1000
	RecordLatency(ms)
}
