package config

import "os"

const (
	defaultPort         = "8080"
	defaultDatabasePath = "data/blog.db"
)

type Config struct {
	Port         string
	DatabasePath string
}

func Load() Config {
	return Config{
		Port:         getEnv("PORT", defaultPort),
		DatabasePath: getEnv("DATABASE_PATH", defaultDatabasePath),
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
