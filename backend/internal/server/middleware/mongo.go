package middleware

import (
	"github.com/ANRlm/querydoctor/backend/internal/db"
	"github.com/gin-gonic/gin"
)

func Mongo() gin.HandlerFunc {
	return func(c *gin.Context) {
		if db.GetMongoClient() != nil {
			c.Set("mongo", db.GetMongoClient())
		}
		c.Next()
	}
}
