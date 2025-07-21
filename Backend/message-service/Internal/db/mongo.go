package db

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"laminar/internal/config"
	"laminar/internal/models"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
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
	var insertedMessages []primitive.ObjectID

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

		// Randomly decide if the message is edited
		isEdited := rand.Intn(4) == 0 // ~25% chance

		// Randomly reply to an earlier message
		var threadParentID *primitive.ObjectID
		if i > 2 && rand.Intn(3) == 0 { // ~33% chance of being a reply
			parentID := insertedMessages[rand.Intn(len(insertedMessages))]
			threadParentID = &parentID
		}

		message := models.Message{
			ID:             primitive.NewObjectID(),
			SenderID:       sender,
			ReceiverType:   receiverType,
			ReceiverID:     receiver,
			Timestamp:      time.Now(),
			Edited:         isEdited,
			ThreadParentID: threadParentID,
			Content: models.MessageContent{
				Text: textSamples[rand.Intn(len(textSamples))],
			},
		}

		if _, err := coll.InsertOne(ctx, message); err != nil {
			return fmt.Errorf("failed to insert message %d: %w", i+1, err)
		}

		insertedMessages = append(insertedMessages, message.ID)
	}

	fmt.Println("✅ Seeded 20 messages into MongoDB with replies and edited flags")
	return nil
}

func AddReactionsToLastMessages(ctx context.Context) error {
	coll := MongoDatabase.Collection("messages")

	users := []string{
		"4261498a-7b23-4bf1-bf16-46d4f3deb513",
		"a0000001-0000-0000-0000-000000000001",
		"a0000002-0000-0000-0000-000000000002",
		"a0000003-0000-0000-0000-000000000003",
		"a0000004-0000-0000-0000-000000000004",
		"a0000005-0000-0000-0000-000000000005",
		"a0000020-0000-0000-0000-000000000020",
	}

	emojis := []string{"👍", "❤️", "😂", "😮", "🎉"}

	// Step 1: Fetch last 500 messages
	cursor, err := coll.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(500))
	if err != nil {
		return fmt.Errorf("failed to fetch messages: %w", err)
	}
	defer cursor.Close(ctx)

	var messages []models.Message
	if err := cursor.All(ctx, &messages); err != nil {
		return fmt.Errorf("failed to decode messages: %w", err)
	}

	// Step 2: Loop and update each message with reactions
	for _, msg := range messages {
		reactions := make(map[string][]string)

		// Randomly pick 1–3 emojis
		emojiCount := rand.Intn(3) + 1
		rand.Shuffle(len(emojis), func(i, j int) { emojis[i], emojis[j] = emojis[j], emojis[i] })
		selectedEmojis := emojis[:emojiCount]

		for _, emoji := range selectedEmojis {
			// Randomly pick 1–3 users per emoji
			userCount := rand.Intn(3) + 1
			rand.Shuffle(len(users), func(i, j int) { users[i], users[j] = users[j], users[i] })
			reactions[emoji] = users[:userCount]
		}

		// Step 3: Update the message
		_, err := coll.UpdateOne(ctx,
			bson.M{"_id": msg.ID},
			bson.M{"$set": bson.M{"reactions": reactions}},
		)
		if err != nil {
			return fmt.Errorf("failed to update message %s: %w", msg.ID.Hex(), err)
		}
	}

	fmt.Println("✅ Added reactions to last 500 messages.")
	return nil
}
