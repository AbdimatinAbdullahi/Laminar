package db

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"laminar/Internal/config"
	"laminar/Internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDatabase *mongo.Database

func InitMongo(ctx context.Context) error {
	cfg := config.Load()
	uri := cfg.MongoURI
	dbName := cfg.MONGO_DB

	clientOpts := options.Client().ApplyURI(uri).SetConnectTimeout(2 * time.Second)

	client, err := mongo.Connect(ctx, clientOpts)

	if err != nil {
		return fmt.Errorf("mongodb ping failed: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("mongo ping failed %w", err)
	}

	MongoClient = client
	MongoDatabase = client.Database(dbName)

	fmt.Println("Connected to mongoDB ✅🎉")
	return nil
}

func CloseMongo(ctx context.Context) {
	if MongoClient != nil {
		_ = MongoClient.Disconnect(ctx)
	}
}

func GetMongo() *mongo.Database {
	return MongoDatabase
}

func SeedMessages(ctx context.Context) error {
	users := []uuid.UUID{
		uuid.MustParse("4261498a-7b23-4bf1-bf16-46d4f3deb513"),
		uuid.MustParse("a0000001-0000-0000-0000-000000000001"),
		uuid.MustParse("a0000002-0000-0000-0000-000000000002"),
		uuid.MustParse("a0000003-0000-0000-0000-000000000003"),
		uuid.MustParse("a0000004-0000-0000-0000-000000000004"),
		uuid.MustParse("a0000005-0000-0000-0000-000000000005"),
		uuid.MustParse("a0000020-0000-0000-0000-000000000020"),
	}

	channels := []uuid.UUID{
		uuid.MustParse("caa11111-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
		uuid.MustParse("caa11112-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
		uuid.MustParse("caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
		uuid.MustParse("caa11114-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
		uuid.MustParse("cbb11111-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
		uuid.MustParse("cbb11112-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
		uuid.MustParse("cbb11113-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
		uuid.MustParse("cbb11114-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
	}

	textSamples := []string{
		"Hello team!",
		"Let’s meet at 3 PM.",
		"Pushed latest changes to Git.",
		"Any blockers for today?",
		"I’ll be AFK for 10 mins.",
		"Sprint planning done.",
		"Check the staging environment.",
		"Issue resolved. Please verify.",
		"Code review requested.",
		"Thanks for the update!",
	}

	coll := MongoDatabase.Collection("messages")

	for i := 0; i < 20; i++ {
		sender := users[rand.Intn(len(users))]

		var receiver uuid.UUID
		receiverType := "user"

		if i%2 == 0 {
			receiverType = "channel"
			receiver = channels[rand.Intn(len(channels))]
		} else {
			for {
				receiver = users[rand.Intn(len(users))]
				if receiver != sender {
					break
				}
			}
		}

		message := models.Message{
			ID:           primitive.NewObjectID(),
			SenderID:     sender,
			ReceiverType: receiverType,
			ReceiverID:   receiver,
			Timestamp:    time.Now(),
			Edited:       false,
			Content: models.MessageContent{
				Text: textSamples[rand.Intn(len(textSamples))],
			},
		}

		if _, err := coll.InsertOne(ctx, message); err != nil {
			return fmt.Errorf("failed to insert message %d: %w", i+1, err)
		}
	}

	fmt.Println("✅ Seeded 20 messages into MongoDB")
	return nil
}
