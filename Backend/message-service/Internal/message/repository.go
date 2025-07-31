package message

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"gorm.io/gorm"
)

type Repository interface {
	SaveMessageToDb(ctx context.Context, msg MessagePayload) error
	EditMessage(ctx context.Context, msgId string, newContent string) error
	DeleteMessage(ctx context.Context, msgid primitive.ObjectID) error
	NewReaction(ctx context.Context, msgId string, reactorId string, emoji string) error
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

func (r *repository) SaveMessageToDb(ctx context.Context, msg MessagePayload) error {
	collection := r.monngo.Client().Database("laminar").Collection("messages")

	// receiverUUID := uuid.MustParse(msg.ReceiverID)
	// senderUUID := uuid.MustParse(msg.SenderID)

	message := bson.M{
		"_id":           msg.ID,
		"receiver_type": msg.ReceiverType,
		"receiver_id":   uuid.UUID(uuid.MustParse(msg.ReceiverID)),
		"content":       msg.Content,
		"timestamp":     time.Now(),
		"edited":        msg.Edited,
		"sender_id":     uuid.UUID(uuid.MustParse(msg.SenderID)),
	}

	log.Println("Message inserting into db")
	result, err := collection.InsertOne(ctx, message)
	if err != nil {
		log.Printf("Error while inserting message into db: %v", err)
		return err
	}

	oid, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return fmt.Errorf("unexpected error")
	}

	log.Println("✅ Message inserted with ID:", oid.Hex())
	return nil
}

func (r *repository) DeleteMessage(ctx context.Context, msgId primitive.ObjectID) error {
	collection := r.monngo.Client().Database("laminar").Collection("messages")
	filter := bson.M{
		"_id": msgId,
	}

	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		log.Fatal("Error while deleting the message: ", err)
		return err
	}
	log.Println(result.DeletedCount)
	return nil
}

func (r *repository) EditMessage(ctx context.Context, msgId string, newContent string) error {
	colllection := r.monngo.Client().Database("laminar").Collection("messages")
	objectMsgId, err := primitive.ObjectIDFromHex(msgId)
	if err != nil {
		return err
	}
	filter := bson.M{
		"_id": objectMsgId,
	}
	update := bson.M{
		"$set": bson.M{
			"content.text": newContent,
			"edited":       true,
		},
	}

	result, err := colllection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Fatal("Error occurred while editing the message: ", err)
		return err
	}
	log.Println("Success editing message: ", result.ModifiedCount)
	return nil

}

func (r *repository) NewReaction(ctx context.Context, msgId string, reactorId string, emoji string) error {
	collection := r.monngo.Client().Database("laminar").Collection("messages")
	log.Println("Messaged id", msgId)
	objectMsgId, err := primitive.ObjectIDFromHex(msgId)
	if err != nil {
		return err
	}
	filter := bson.M{
		"_id": objectMsgId,
	}

	update := bson.M{
		"$addToSet": bson.M{
			fmt.Sprintf("reactions.%s", emoji): reactorId,
		},
	}

	result, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Println("Error inserting into db: ", err)
		return err
	}
	log.Println(result.ModifiedCount)
	return nil

}

func (r *repository) Removereaction(ctx context.Context, msgId string, reactorId string) error {
	return nil
}
