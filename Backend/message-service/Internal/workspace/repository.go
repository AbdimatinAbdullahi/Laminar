package workspace

import (
	"context"
	"laminar/Internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	// "go.mongodb.org/mongo-driver/internal/uuid"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

type Repository interface {
	GetWorspaceByUserId(userId string) ([]models.Workspace, error) // Later after advancments it can be slices of workspaces that user belongs to
	GetWorspaceMmebers(workspaceId string) ([]models.WorkspaceMemberships, error)
	GetChannelsByWorkspace(workspaceId string) ([]models.Channels, error)
	GetChannelsMessages(channelId string) ([]models.Message, error)
}

type repository struct {
	postgres *gorm.DB
	mongo    *mongo.Database
}

// Constructor function that takes in the value and assign it to  a struct concrete type: db
func NewRepository(postgres *gorm.DB, mongo *mongo.Database) Repository {
	return &repository{
		postgres: postgres,
		mongo:    mongo,
	}
}

func (r *repository) GetWorspaceByUserId(userId string) ([]models.Workspace, error) {
	var workspaces []models.Workspace
	err := r.postgres.
		Joins("JOIN workspace_memberships wm ON wm.workspace_id = workspaces.id").
		Where("wm.user_id = ?", userId).
		Find(&workspaces).Error
	return workspaces, err
}

func (r *repository) GetChannelsByWorkspace(workspaceId string) ([]models.Channels, error) {
	var channels []models.Channels
	err := r.postgres.Where("workspace_id = ?", workspaceId).Find(&channels).Error
	return channels, err
}

func (r *repository) GetWorspaceMmebers(workspaceId string) ([]models.WorkspaceMemberships, error) {
	var members []models.WorkspaceMemberships
	err := r.postgres.Where("workspace_id = ?", workspaceId).Find(&members).Error
	return members, err
}

func (r *repository) GetChannelsMessages(channelId string) ([]models.Message, error) {
	coll := r.mongo.Collection("messages")

	cid, err := uuid.Parse(channelId)
	if err != nil {
		return nil, err
	}

	filter := bson.M{
		"receiver_type": "channel",
		"receiver_id":   cid,
	}

	opts := options.Find().SetLimit(50).SetSort(bson.M{"timestamp": -1})

	cur, err := coll.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}

	defer cur.Close(context.Background())

	var messages []models.Message

	for cur.Next(context.Background()) {
		var msg models.Message
		if err := cur.Decode(&msg); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return messages, err

}
