package message

import (
	"context"
	"fmt"
	"laminar/internal/models"
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
	GetParentMessage(ctx context.Context, parentId string) (*models.Message, error)
	CreateNewChannel(channelName string, workspaceId string, creatorId string, isPrivate bool) (models.Channels, error)
	CreateWorkspace(workspaceName string, userId string) (models.Workspace, error)
	ValidateUser(userId string, channelId string) (bool, error)
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

	if msg.ThreadParentID != "" {
		message["thread_parent_id"] = msg.ThreadParentID
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

func (r *repository) GetParentMessage(ctx context.Context, parentId string) (*models.Message, error) {
	var message models.Message
	collection := r.monngo.Client().Database("laminar").Collection("messages")

	objectId, err := primitive.ObjectIDFromHex(parentId)
	if err != nil {
		return &models.Message{}, err
	}

	filer := bson.M{
		"_id": objectId,
	}

	err = collection.FindOne(context.TODO(), filer).Decode(&message)

	if err != nil {
		return &models.Message{}, err
	}

	var sender models.User
	err = r.db.Table("users").Select("id, fullname, email").Where("id = ?", message.SenderID).First(&sender).Error
	if err != nil {
		return &models.Message{}, err
	}

	message.Sender = &sender

	return &message, nil
}

func (r *repository) CreateNewChannel(channelName string, workspaceId string, creatorId string, isPrivate bool) (models.Channels, error) {

	parsedCreatorId, err := uuid.Parse(creatorId)

	if err != nil {
		return models.Channels{}, err
	}

	parsedWorkspaceId, err := uuid.Parse(workspaceId)
	if err != nil {
		return models.Channels{}, err
	}

	channel := models.Channels{
		ID:          uuid.New(),
		Name:        channelName,
		CreatedBy:   parsedCreatorId,
		WorkspaceID: parsedWorkspaceId,
		IsPrivate:   isPrivate,
	}

	log.Println("Channel to be created: ", channel)

	result := r.db.Create(&channel)
	if result.Error != nil {
		log.Println("Error while creating channel", result.Error)
		return models.Channels{}, result.Error
	}
	return channel, nil
}

func (r *repository) CreateWorkspace(workspaceName string, userId string) (models.Workspace, error) {
	parsedOwnerId, err := uuid.Parse(userId)
	if err != nil {
		return models.Workspace{}, err
	}

	workspace := models.Workspace{
		ID:      uuid.New(),
		OwnerID: parsedOwnerId,
		Name:    workspaceName,
	}

	workspaceMembership := models.WorkspaceMemberships{
		ID:          uuid.New(),
		WorkspaceID: workspace.ID,
		UserID:      parsedOwnerId,
		Role:        "owner",
		JoinedAt:    time.Now(),
	}

	result2 := r.db.Create(&workspaceMembership)
	if result2.Error != nil {
		log.Println("Something went wrong while creating workspaces")
		return models.Workspace{}, result2.Error
	}

	log.Println("Workspace memberships created!")

	result0 := r.db.Create(&workspace)
	if result0.Error != nil {
		return models.Workspace{}, result0.Error
	}

	log.Println("Workspace created!")

	return workspace, nil

}

func (r *repository) ValidateUser(userId string, channelId string) (bool, error) {
	var exists bool
	err := r.db.Table("channel_memberships").Select("count(*) > 0").Where("user_id = ? AND channel_id = ?", userId, channelId).Scan(&exists).Error
	if err != nil {
		return false, err
	}
	return exists, nil
}
