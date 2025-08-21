package db

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"laminar/internal/config"
	"laminar/internal/models"
)

var GormDB *gorm.DB

func InitPostgres() error {

	cfg := config.Load()
	dsn := cfg.POSTGRES_DSN

	var err error

	GormDB, err = gorm.Open(postgres.Open(dsn))

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
		&models.WorkspaceInvitations{},
	); err != nil {
		log.Fatalf("Failed to migrate the models: %v", err)
	}

	log.Println("Tables created successfully! ✅")
}

func GetPostgresDB() *gorm.DB {
	return GormDB
}
