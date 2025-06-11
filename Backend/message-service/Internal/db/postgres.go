package db

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"laminar/Internal/config"
	"laminar/Internal/models"
)

var GormDB *gorm.DB

func InitPostgres() error {

	cfg := config.Load()
	dsn := cfg.POSTGRES_DSN

	var err error

	GormDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to postgres: %w", err)
	}

	sqlDB, err := GormDB.DB()

	if err != nil {
		return fmt.Errorf("failed to get raw DB object: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("✅ Connected successfuly")

	return nil
}

func ClosePostgres() {
	sqlDB, err := GormDB.DB()
	if err != nil {
		log.Printf("Error getting raw DB object: %v", err)
		return
	}
	if err := sqlDB.Close(); err != nil {
		log.Printf("Error closing PostgreSQL connection: %v", err)
	} else {
		log.Println("✅ PostgreSQL connection closed successfully.")
	}
}

func AutoMigrateTables() {
	if err := GormDB.AutoMigrate(
		&models.Workspace{},
		&models.WorkspaceMemberships{},
		&models.Channels{},
		&models.ChannelMemberships{},
	); err != nil {
		log.Fatalf("Failed to migrate the models: %v", err)
	}

	log.Println("Tables created successfully! ✅")
}
