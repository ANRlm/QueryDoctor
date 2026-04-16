package cache

import (
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
)

func TestQueryCache_SetGetInvalidate(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	qc := NewQueryCache(mr.Addr(), "", 0)

	tests := []struct {
		name  string
		key   string
		value interface{}
		ttl   int
	}{
		{"string value", "k1", "value1", 0},
		{"int value", "k2", 42, 0},
		{"map value", "k3", map[string]string{"a": "b"}, 0},
		{"with TTL", "k4", "ttl-value", 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := qc.Set(tt.key, tt.value, tt.ttl)
			if err != nil {
				t.Fatalf("Set failed: %v", err)
			}

			got, err := qc.Get(tt.key)
			if err != nil {
				t.Fatalf("Get failed: %v", err)
			}
			if got == nil {
				t.Fatalf("expected value for key %s, got nil", tt.key)
			}
		})
	}

	// Test Invalidate
	err = qc.Invalidate("k1")
	if err != nil {
		t.Fatalf("Invalidate failed: %v", err)
	}

	got, err := qc.Get("k1")
	if err != nil {
		t.Fatalf("Get after Invalidate failed: %v", err)
	}
	if got != nil {
		t.Fatalf("expected nil after Invalidate, got %v", got)
	}

	qc.Close()
}

func TestQueryCache_GetNonExistent(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	qc := NewQueryCache(mr.Addr(), "", 0)
	defer qc.Close()

	got, err := qc.Get("nonexistent")
	if err != nil {
		t.Fatalf("Get for nonexistent key failed: %v", err)
	}
	if got != nil {
		t.Fatalf("expected nil for nonexistent key, got %v", got)
	}
}

func TestQueryCache_TTL(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	qc := NewQueryCache(mr.Addr(), "", 0)
	defer qc.Close()

	// Set with 1 second TTL
	err = qc.Set("ttl-key", "ttl-value", 1)
	if err != nil {
		t.Fatalf("Set with TTL failed: %v", err)
	}

	// Get immediately should work
	got, err := qc.Get("ttl-key")
	if err != nil {
		t.Fatalf("Get immediately after Set failed: %v", err)
	}
	if got == nil {
		t.Fatal("expected value immediately after Set with TTL")
	}

	// Fast forward miniredis time
	mr.FastForward(2 * time.Second)

	// Get after TTL should return nil
	got, err = qc.Get("ttl-key")
	if err != nil {
		t.Fatalf("Get after TTL expired failed: %v", err)
	}
	if got != nil {
		t.Fatalf("expected nil after TTL expired, got %v", got)
	}
}

func TestQueryCache_Ping(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	qc := NewQueryCache(mr.Addr(), "", 0)
	defer qc.Close()

	err = qc.Ping()
	if err != nil {
		t.Fatalf("Ping failed: %v", err)
	}
}
