package db

import (
	"context"
	"testing"

	"github.com/alicebob/miniredis/v2"
)

func TestInitRedis_MiniredisPing(t *testing.T) {
	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("failed to start miniredis: %v", err)
	}
	defer mr.Close()

	ctx := context.Background()
	err = InitRedis(ctx, mr.Addr(), "", 0)
	if err != nil {
		t.Fatalf("InitRedis failed: %v", err)
	}
	defer RedisClient.Close()

	err = Ping(ctx)
	if err != nil {
		t.Fatalf("Ping failed: %v", err)
	}
}

func TestInitRedis_InvalidAddr(t *testing.T) {
	ctx := context.Background()
	err := InitRedis(ctx, "127.0.0.1:0", "", 0)
	if err == nil {
		t.Fatal("expected error for invalid address, got nil")
	}
}

func TestPing_NotInitialized(t *testing.T) {
	// Save original client
	orig := RedisClient
	RedisClient = nil
	defer func() { RedisClient = orig }()

	ctx := context.Background()
	err := Ping(ctx)
	if err == nil {
		t.Fatal("expected error when RedisClient is nil")
	}
}
