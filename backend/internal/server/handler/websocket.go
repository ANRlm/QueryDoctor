package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WSHandler struct{}

func NewWSHandler() *WSHandler {
	return &WSHandler{}
}

func (h *WSHandler) HandleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		if messageType == websocket.TextMessage {
			log.Printf("Received: %s", message)
			if err := conn.WriteMessage(websocket.TextMessage, []byte("pong")); err != nil {
				log.Printf("Write error: %v", err)
				break
			}
		}
	}
}

func (h *WSHandler) HandleAgentWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		if messageType == websocket.TextMessage {
			log.Printf("Agent WS Received: %s", message)
			response := []byte(`{"type":"received","data":"` + string(message) + `"}`)
			if err := conn.WriteMessage(websocket.TextMessage, response); err != nil {
				log.Printf("Write error: %v", err)
				break
			}
		}
	}
}

func (h *WSHandler) KeepAlive(conn *websocket.Conn, duration time.Duration) {
	ticker := time.NewTicker(duration)
	defer ticker.Stop()
	for {
		<-ticker.C
		if err := conn.WriteMessage(websocket.PingMessage, nil); err != nil {
			return
		}
	}
}
