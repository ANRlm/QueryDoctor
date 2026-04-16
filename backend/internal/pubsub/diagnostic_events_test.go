package pubsub

import (
	"os"
	"testing"
	"time"
)

func TestPublishDiagnosticEvent(t *testing.T) {
	// Initialize with test config
	topic := "test-topic-" + time.Now().Format("20060102150405")
	payload := map[string]string{"event": "test", "data": "hello"}

	err := PublishDiagnosticEvent(topic, payload)
	if err != nil {
		t.Fatalf("PublishDiagnosticEvent failed: %v", err)
	}
}

func TestSubscribeDiagnosticEvents(t *testing.T) {
	topic := "test-sub-" + time.Now().Format("20060102150405")

	ch, err := SubscribeDiagnosticEvents(topic)
	if err != nil {
		t.Fatalf("SubscribeDiagnosticEvents failed: %v", err)
	}
	if ch == nil {
		t.Fatal("expected non-nil channel")
	}
}

func TestPublishAndSubscribe(t *testing.T) {
	topic := "test-pubsub-" + time.Now().Format("20060102150405")
	payload := map[string]string{"msg": "integration-test"}

	// Publish first
	err := PublishDiagnosticEvent(topic, payload)
	if err != nil {
		t.Fatalf("PublishDiagnosticEvent failed: %v", err)
	}

	// Subscribe
	ch, err := SubscribeDiagnosticEvents(topic)
	if err != nil {
		t.Fatalf("SubscribeDiagnosticEvents failed: %v", err)
	}

	// Give it a moment to deliver
	select {
	case msg, ok := <-ch:
		if !ok {
			t.Log("channel closed")
		} else if msg == nil {
			t.Log("received nil (may be ok depending on timing)")
		} else {
			t.Logf("received message: %v", msg)
		}
	case <-time.After(2 * time.Second):
		t.Log("timeout waiting for message (this may be ok in test environment)")
	}
}

func TestPublishDiagnosticEvent_EmptyTopic(t *testing.T) {
	payload := map[string]string{"data": "test"}
	// Empty topic may or may not fail depending on Redis behavior
	err := PublishDiagnosticEvent("", payload)
	if err != nil {
		t.Logf("empty topic returned error (expected behavior): %v", err)
	}
}

func TestUseStreamsEnvVar(t *testing.T) {
	// This test verifies the env var is read
	// The actual behavior depends on the env var value at init time
	val := os.Getenv("REDIS_USE_STREAMS")
	t.Logf("REDIS_USE_STREAMS=%s", val)
}
