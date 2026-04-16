package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ANRlm/querydoctor/backend/internal/cache"
	"github.com/ANRlm/querydoctor/backend/internal/server/middleware"
	"github.com/alicebob/miniredis/v2"
	"github.com/gin-gonic/gin"
)

func setupTestRouter(t *testing.T) (*gin.Engine, *miniredis.Miniredis, *CacheHandler) {
	gin.SetMode(gin.TestMode)

	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}

	qc := cache.NewQueryCache(mr.Addr(), "", 0)
	ch := NewCacheHandler(qc)

	r := gin.New()
	r.Use(middleware.Redis())

	// Register routes
	r.GET("/api/cache/:key", ch.GetCache)
	r.POST("/api/cache/set", ch.SetCache)
	r.DELETE("/api/cache/:key", ch.DeleteCache)

	return r, mr, ch
}

func TestGetCache_NotFound(t *testing.T) {
	r, mr, ch := setupTestRouter(t)
	defer mr.Close()
	defer ch.cache.Close()

	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/cache/nonexistent", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", w.Code)
	}
}

func TestSetCache(t *testing.T) {
	r, mr, ch := setupTestRouter(t)
	defer mr.Close()
	defer ch.cache.Close()

	body := map[string]interface{}{
		"key":   "test-key",
		"value": "test-value",
		"ttl":   60,
	}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/cache/set", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestSetAndGetCache(t *testing.T) {
	r, mr, ch := setupTestRouter(t)
	defer mr.Close()
	defer ch.cache.Close()

	// Set
	body := map[string]interface{}{
		"key":   "get-test",
		"value": "get-value",
		"ttl":   60,
	}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/cache/set", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("set failed: %d - %s", w.Code, w.Body.String())
	}

	// Get
	w2 := httptest.NewRecorder()
	req2 := httptest.NewRequest("GET", "/api/cache/get-test", nil)
	r.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("get failed: %d - %s", w2.Code, w2.Body.String())
	}

	var resp map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &resp)
	if resp["key"] != "get-test" {
		t.Fatalf("expected key 'get-test', got %v", resp["key"])
	}
}

func TestDeleteCache(t *testing.T) {
	r, mr, ch := setupTestRouter(t)
	defer mr.Close()
	defer ch.cache.Close()

	// Set first
	body := map[string]interface{}{
		"key":   "delete-test",
		"value": "delete-value",
		"ttl":   60,
	}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/cache/set", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	// Delete
	w2 := httptest.NewRecorder()
	req2 := httptest.NewRequest("DELETE", "/api/cache/delete-test", nil)
	r.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("delete failed: %d - %s", w2.Code, w2.Body.String())
	}

	// Verify deleted
	w3 := httptest.NewRecorder()
	req3 := httptest.NewRequest("GET", "/api/cache/delete-test", nil)
	r.ServeHTTP(w3, req3)

	if w3.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after delete, got %d", w3.Code)
	}
}

func TestSetCache_MissingKey(t *testing.T) {
	r, mr, ch := setupTestRouter(t)
	defer mr.Close()
	defer ch.cache.Close()

	body := map[string]interface{}{
		"value": "test-value",
	}
	jsonBody, _ := json.Marshal(body)

	w := httptest.NewRecorder()
	req := httptest.NewRequest("POST", "/api/cache/set", bytes.NewReader(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for missing key, got %d", w.Code)
	}
}
