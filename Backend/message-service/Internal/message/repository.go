package message

import (
	"context"
	"laminar/internal/models"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

type Repository interface {
	SaveMessageToDb(ctx context.Context, msg *models.Message) error
	EditMessage(ctx context.Context, msgId string, newContent string) error
	DeleteMessage(ctx context.Context, msgid string) error
}

type repository struct {
	db     *gorm.DB
	monngo *mongo.Database
}

func NewRepository(db *gorm.DB, mongo *mongo.Database) Repository {
	return &repository{
		db:     db,
		monngo: mongo,
	}
}

func (r *repository) SaveMessageToDb(ctx context.Context, msg *models.Message) error {
	collection := r.monngo.Client().Database("laminar").Collection("messages")
	message := bson.M{
		"sender_id":     msg.SenderID,
		"receiver_type": "channel",
		"receiver_id":   msg.ReceiverID,
		"content":       msg.Content,
		"timestamp":     msg.Timestamp,
		"edited":        false,
	}
	reslult, err := collection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Error while inserting message into db: %v", err)
		return err
	}
	log.Println(reslult)
	return nil
}

func (r *repository) DeleteMessage(ctx context.Context, msgId string) error {
	collection := r.monngo.Client().Database("laminar").Collection("message")
	objectId, err := primitive.ObjectIDFromHex(msgId)
	if err != nil {
		log.Println("Invalid message ID format:", err)
		return err
	}
	filter := bson.M{
		"_id": objectId,
	}

	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		log.Fatal("Error while deleting the message: ", err)
		return err
	}
	log.Println(result)
	return nil
}

func (r *repository) EditMessage(ctx context.Context, msgId string, newContent string) error {
	return nil
}
