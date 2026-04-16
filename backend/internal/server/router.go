package server

import (
	"log"

	"github.com/ANRlm/querydoctor/backend/internal/auth"
	"github.com/ANRlm/querydoctor/backend/internal/cache"
	"github.com/ANRlm/querydoctor/backend/internal/config"
	"github.com/ANRlm/querydoctor/backend/internal/server/handler"
	"github.com/ANRlm/querydoctor/backend/internal/server/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()

	router.Use(middleware.Recovery())
	router.Use(middleware.Logging())

	router.GET("/health", handler.HealthCheck)
	router.GET("/api/diagnose", handler.DiagnoseSSE)

	var cacheHandler *handler.CacheHandler
	if cfg.Redis.Addr != "" {
		qc := cache.NewQueryCache(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB)
		if err := qc.Ping(); err != nil {
			log.Printf("[WARN] Redis connection failed: %v. Cache routes disabled.", err)
		} else {
			cacheHandler = handler.NewCacheHandler(qc)
		}
	}

	metricsHandler := handler.NewMetricsHandler()
	wsHandler := handler.NewWSHandler()
	authHandler := handler.NewAuthHandler()

	router.POST("/api/auth/register", authHandler.Register)
	router.POST("/api/auth/login", authHandler.Login)

	api := router.Group("/api")
	api.Use(auth.AuthMiddleware())
	{
		api.POST("/diagnose", handler.Diagnose)
		api.POST("/db/test", handler.TestDBConnection)
		api.POST("/auth/refresh", authHandler.RefreshToken)
		api.GET("/auth/me", authHandler.Me)

		if cacheHandler != nil {
			api.GET("/cache/:key", cacheHandler.GetCache)
			api.POST("/cache/set", cacheHandler.SetCache)
			api.DELETE("/cache/:key", cacheHandler.DeleteCache)
		}

		api.GET("/metrics/cache", metricsHandler.GetCacheStats)
	}

	router.GET("/ws", wsHandler.HandleWS)
	router.GET("/ws/agent", wsHandler.HandleAgentWS)

	return router
}
