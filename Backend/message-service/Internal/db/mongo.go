package db

import (
	"context"
	"fmt"
	"time"

	"laminar/Internal/config"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDatabase *mongo.Database

func InitMongo(ctx context.Context) error {
	cfg := config.Load()
	uri := cfg.MongoURI
	dbName := cfg.MONGO_DB

	clientOpts := options.Client().ApplyURI(uri).SetConnectTimeout(5 * time.Second)

	client, err := mongo.Connect(ctx, clientOpts)

	if err != nil {
		return fmt.Errorf("mongodb ping failed: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("mongo ping failed %w", err)
	}

	MongoClient = client
	MongoDatabase = client.Database(dbName)

	fmt.Println("Connected to mongoDB")
	return nil
}

func CloseMongo(ctx context.Context) {
	if MongoClient != nil {
		_ = MongoClient.Disconnect(ctx)
	}
}
