package config

import "os"

const (
	defaultPort         = "8080"
	defaultDatabasePath = "data/blog.db"
	defaultFrontendURL  = "http://localhost:5173"
	defaultAdminUser    = "admin"
	defaultAdminPass    = "admin123456"
	defaultSessionKey   = "change-this-session-secret"
)

type Config struct {
	Port               string
	DatabasePath       string
	FrontendURL        string
	AdminUsername      string
	AdminPassword      string
	AdminSessionSecret string
}

func Load() Config {
	return Config{
		Port:               getEnv("PORT", defaultPort),
		DatabasePath:       getEnv("DATABASE_PATH", defaultDatabasePath),
		FrontendURL:        getEnv("FRONTEND_URL", defaultFrontendURL),
		AdminUsername:      getEnv("ADMIN_USERNAME", defaultAdminUser),
		AdminPassword:      getEnv("ADMIN_PASSWORD", defaultAdminPass),
		AdminSessionSecret: getEnv("ADMIN_SESSION_SECRET", defaultSessionKey),
	}
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
