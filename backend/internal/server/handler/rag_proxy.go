package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RagProxy(c *gin.Context) {
	path := c.Param("path")
	targetURL := agentURL + "/rag" + path

	if c.Request.URL.RawQuery != "" {
		targetURL += "?" + c.Request.URL.RawQuery
	}

	agentReq, err := http.NewRequest(c.Request.Method, targetURL, c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create request"})
		return
	}
	agentReq.Header = c.Request.Header.Clone()

	client := &http.Client{}
	resp, err := client.Do(agentReq)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to connect to agent"})
		return
	}
	defer resp.Body.Close()

	for k, vv := range resp.Header {
		for _, v := range vv {
			c.Header(k, v)
		}
	}
	c.Status(resp.StatusCode)
	io.Copy(c.Writer, resp.Body)
}
