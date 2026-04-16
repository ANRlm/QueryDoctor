package middleware

import (
	"github.com/ANRlm/querydoctor/internal/db"
	"github.com/gin-gonic/gin"
)

// Redis returns a middleware that injects the global Redis client into the context.
func Redis() gin.HandlerFunc {
	return func(c *gin.Context) {
		if db.RedisClient != nil {
			c.Set("redis", db.RedisClient)
		}
		c.Next()
	}
}
