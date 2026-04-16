package db

import (
	"context"
	"testing"
)

func TestInitMongo_InvalidURI(t *testing.T) {
	ctx := context.Background()
	err := InitMongo(ctx, "mongodb://invalid:27017")
	if err == nil {
		t.Fatal("expected error for invalid MongoDB URI")
	}
}

func TestPingMongo_NotInitialized(t *testing.T) {
	ctx := context.Background()
	err := PingMongo(ctx)
	if err == nil {
		t.Fatal("expected error when MongoClient is nil")
	}
}

func TestGetCollection_NotInitialized(t *testing.T) {
	ctx := context.Background()
	_, err := GetCollection(ctx, "testdb", "testcoll")
	if err == nil {
		t.Fatal("expected error when MongoClient is nil")
	}
}

func TestListDatabases_NotInitialized(t *testing.T) {
	ctx := context.Background()
	_, err := ListDatabases(ctx)
	if err == nil {
		t.Fatal("expected error when MongoClient is nil")
	}
}
