package config

import (
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Backend  BackendConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Redis    RedisConfig
}

type ServerConfig struct {
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type BackendConfig struct {
	URL string
}

type DatabaseConfig struct {
	Type string
	DSN  string
}

type JWTConfig struct {
	Secret string
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

func LoadConfig() (*Config, error) {
	v := viper.New()

	v.SetDefault("server.port", 8080)
	v.SetDefault("server.readtimeout", 5*time.Second)
	v.SetDefault("server.writetimeout", 10*time.Second)
	v.SetDefault("backend.url", "http://agent:8000")
	v.SetDefault("redis.addr", "redis:6379")
	v.SetDefault("redis.db", 0)

	v.AutomaticEnv()

	v.SetConfigName("config")
	v.AddConfigPath("/etc/querydoctor/")
	v.AddConfigPath(".")

	if err := v.ReadInConfig(); err != nil {
	}

	cfg := &Config{}
	if err := v.Unmarshal(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}
