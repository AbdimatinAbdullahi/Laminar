package workspace

import (
	"context"
	"errors"
	"fmt"
	"laminar/internal/models"
	"log"
	"time"

	// "go.mongodb.org/mongo-driver/internal/uuid"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/gorm"
)

type Repository interface {
	GetWorspaceByUserId(userId string) ([]models.Workspace, error) // Later after advancments it can be slices of workspaces that user belongs to
	GetWorkspaceMembers(workspaceId string) ([]UserInfoInWorkspace, error)
	GetChannelsByWorkspace(workspaceId string) ([]models.Channels, error)
	GetWorkspaceDetails(workspaceId string) (WorkspaceDetails, error)
	LeaveWorkspace(workspaceId string, userId string) error
	DeleteWorkspace(workspaceId string) error
	GetRole(userId string, workspaceId string) (string, error)
	GetMessages(channelId string, cursor *time.Time, receiverType string) ([]models.Message, error)
	GetSenderInfo(senderId string) (*models.User, error)
	GetChannelUsers(channelId string) ([]models.User, error)
	GetWorkspaceUsers(workspaceId string) ([]models.User, error)
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

func (r *repository) GetWorkspaceDetails(wsId string) (WorkspaceDetails, error) {

	parsedUUID, err := uuid.Parse(wsId)
	if err != nil {
		return WorkspaceDetails{}, errors.New("invalid UUID format")
	}

	fmt.Println("id converted to uuis", parsedUUID)

	var creator CreatorDetails

	err = r.postgres.
		Table("users").
		Select("users.fullname AS name, users.email").
		Joins("JOIN workspace_memberships wm ON wm.user_id::text = users.id::text").
		Where("wm.workspace_id::text = ? AND wm.role = ?", wsId, "owner").
		Scan(&creator).Error

	if err != nil {
		return WorkspaceDetails{}, err
	}

	var workspace Workspace

	err = r.postgres.
		Table("workspaces").
		Select("workspaces.name, workspaces.created_at").
		Where("workspaces.id = ?::uuid", wsId).
		Scan(&workspace).Error

	if err != nil {
		return WorkspaceDetails{}, err
	}

	return WorkspaceDetails{
		Workspace: workspace,
		Creator:   creator,
	}, nil
}

type CreatorDetails struct {
	Email string
	Name  string
}

type Workspace struct {
	Name        string
	DateCreated string
}

type WorkspaceDetails struct {
	Workspace Workspace
	Creator   CreatorDetails
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

type User struct {
	Name  string
	Email string
}

type UserInWorkspace struct {
	JoinedAt string // changed from time.Time to string
	Role     string
}

type UserInfoInWorkspace struct {
	User          User
	WorkspaceInfo UserInWorkspace
}

func (r *repository) GetWorkspaceMembers(wsId string) ([]UserInfoInWorkspace, error) {
	parsedUUID, err := uuid.Parse(wsId)
	if err != nil {
		return nil, errors.New("invalid UUID format")
	}

	type resultRow struct {
		Name     string
		Email    string
		Role     string
		JoinedAt string
	}

	var rows []resultRow

	err = r.postgres.
		Table("workspace_memberships AS wm").
		Select("u.fullname AS name, u.email, wm.role, wm.joined_at").
		Joins("JOIN users u ON u.id::text = wm.user_id::text").
		Where("wm.workspace_id = ?", parsedUUID).
		Scan(&rows).Error

	if err != nil {
		return nil, err
	}

	var members []UserInfoInWorkspace
	for _, row := range rows {
		member := UserInfoInWorkspace{
			User: User{
				Name:  row.Name,
				Email: row.Email,
			},
			WorkspaceInfo: UserInWorkspace{
				Role:     row.Role,
				JoinedAt: row.JoinedAt,
			},
		}
		members = append(members, member)
	}

	return members, nil
}

// Leaving workspace
func (r *repository) LeaveWorkspace(workspaceId string, userId string) error {
	parsedWsId, err := uuid.Parse(workspaceId)
	if err != nil {
		return err
	}

	parsedUserId, err := uuid.Parse(userId)
	if err != nil {
		return err
	}

	var member models.WorkspaceMemberships

	err = r.postgres.
		Where("workspace_id = ? AND user_id = ?", parsedWsId, parsedUserId).
		First(&member).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errors.New("user not in the workspace")
	} else if err != nil {
		return err
	}

	if member.Role == "owner" {
		return errors.New("owner cannot leave the workspace")
	}

	err = r.postgres.Where("id = ?", member.UserID).Delete(&models.WorkspaceMemberships{}).Error
	if err != nil {
		return err
	}

	return nil
}

func (r *repository) DeleteWorkspace(workspaceId string) error {
	// Delete first all messages
	// Delete all channels
	// Remove all the workspace memberships
	return nil
}

func (r *repository) GetRole(userId string, workspaceId string) (string, error) {
	var member models.WorkspaceMemberships

	parsedWsId, err := uuid.Parse(workspaceId)
	if err != nil {
		return "", err
	}

	parsedUserId, err := uuid.Parse(userId)
	if err != nil {
		return "", err
	}

	err = r.postgres.Table("workspace_memberships").Where("user_id = ? AND workspace_id = ?", parsedUserId, parsedWsId).Find(&member).Error
	if err != nil {
		return "", err
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", errors.New("user not found")
	}

	return member.Role, nil
}

func (r *repository) GetMessages(channelId string, cursor *time.Time, receiverType string) ([]models.Message, error) {

	collection := r.mongo.Client().Database("laminar").Collection("messages")

	parsedID, err := uuid.Parse(channelId)
	if err != nil {
		return nil, err
	}

	filter := bson.M{
		"receiver_type": receiverType,
		"receiver_id":   parsedID,
	}

	if cursor != nil {
		filter["timestamp"] = bson.M{"$lt": *cursor}
	}

	opts := options.Find().SetSort(bson.D{{Key: "timestamp", Value: -1}}).SetLimit(20)

	cursorReslt, err := collection.Find(context.TODO(), filter, opts)

	if err != nil {
		return nil, err
	}

	defer cursorReslt.Close(context.TODO())

	var messages []models.Message

	if err := cursorReslt.All(context.TODO(), &messages); err != nil {
		return nil, err
	}

	for i := range messages {
		sender, err := r.GetSenderInfo(messages[i].SenderID.String())
		if err != nil {
			log.Println("Error while getting user information: ", err)
		}
		messages[i].Sender = sender
	}

	return messages, nil

}

func (r *repository) GetSenderInfo(senderId string) (*models.User, error) {
	userId, err := uuid.Parse(senderId)
	if err != nil {
		return nil, err
	}

	var user models.User
	err = r.postgres.Table("users").
		Select("id, fullname, email").
		Where("id = ?", userId).
		First(&user).Error

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *repository) GetChannelUsers(channelId string) ([]models.User, error) {
	parsedChannelId, err := uuid.Parse(channelId)
	if err != nil {
		return nil, err
	}

	var memberIds []string
	err = r.postgres.
		Table("channel_memberships").
		Where("channel_id = ?", parsedChannelId).
		Pluck("user_id", &memberIds).Error

	if err != nil {
		return nil, err
	}

	if len(memberIds) == 0 {
		return []models.User{}, nil
	}

	var users []models.User
	err = r.postgres.
		Table("users").
		Select("id, fullname, email").
		Where("id IN ?", memberIds).
		Scan(&users).Error
	if err != nil {
		return nil, err
	}

	return users, nil

}

func (r *repository) GetWorkspaceUsers(workspaceId string) ([]models.User, error) {
	parsedWorkspaceId, err := uuid.Parse(workspaceId)
	if err != nil {
		return nil, err
	}

	var membersId []string
	err = r.postgres.
		Table("workspace_memberships").
		Where("workspace_id = ?", parsedWorkspaceId).
		Pluck("user_id", &membersId).Error
	if err != nil {
		log.Println("Error occuring in fetching the members id users: ", err)
		return nil, err
	}

	var users []models.User
	err = r.postgres.
		Table("users").
		Select("id, fullname, email").
		Where("id IN ?", membersId).
		Scan(&users).Error
	if err != nil {
		log.Println("Error occuring in fetching the workspace users: ", err)
		return nil, err
	}
	return users, nil
}
