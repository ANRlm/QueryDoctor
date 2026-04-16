package server

import (
	"github.com/ANRlm/querydoctor/internal/cache"
	"github.com/ANRlm/querydoctor/internal/config"
	"github.com/ANRlm/querydoctor/internal/server/handler"
	"github.com/ANRlm/querydoctor/internal/server/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	router := gin.New()

	router.Use(middleware.Recovery())
	router.Use(middleware.Logging())

	router.GET("/health", handler.HealthCheck)

	var cacheHandler *handler.CacheHandler
	if cfg.Redis.Addr != "" {
		qc := cache.NewQueryCache(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB)
		cacheHandler = handler.NewCacheHandler(qc)
	}

	metricsHandler := handler.NewMetricsHandler()

	api := router.Group("/api")
	{
		api.POST("/diagnose", handler.Diagnose)
		api.POST("/db/test", handler.TestDBConnection)

		if cacheHandler != nil {
			api.GET("/cache/:key", cacheHandler.GetCache)
			api.POST("/cache/set", cacheHandler.SetCache)
			api.DELETE("/cache/:key", cacheHandler.DeleteCache)
		}

		api.GET("/metrics/cache", metricsHandler.GetCacheStats)
	}

	return router
}
