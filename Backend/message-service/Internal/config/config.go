package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI     string
	POSTGRES_DSN string
	MONGO_DB     string
	SECRET_KEY   string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("something went wrong while accessing enviroment variables")
	}

	return &Config{
		MongoURI:     os.Getenv("MONGO_URI"),
		MONGO_DB:     os.Getenv("MONGO_DB"),
		POSTGRES_DSN: os.Getenv("POSTGRES_DSN"),
		SECRET_KEY:   os.Getenv("SECRET_KEY"),
	}
}
