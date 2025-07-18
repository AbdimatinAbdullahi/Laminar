package message

import (
	"context"
	"laminar/internal/models"

	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

type Repository interface {
	SaveMessageToDb(ctx context.Context, msg *models.Message) error
}

type repository struct {
	db     *gorm.DB
	monngo *mongo.Client
}

func NewRepository(db *gorm.DB, mongo *mongo.Client) Repository {
	return &repository{
		db:     db,
		monngo: mongo,
	}
}

func (r *repository) SaveMessageToDb(ctx context.Context, msg *models.Message) error {
	return nil
}
