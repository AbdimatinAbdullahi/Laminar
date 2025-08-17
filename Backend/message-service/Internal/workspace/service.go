package workspace

import (
	"errors"
	"fmt"
	"laminar/internal/models"
	"log"
	"strings"
	"time"
)

type Service interface {
	GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error)
	GetWorkspaceDetails(wsId string) (WorkspaceDetails, error)
	GetMembers(wsId string) ([]UserInfoInWorkspace, error)
	LeaveWorkspace(wsId string, userId string) error
	DeleteWorkspace(wsId string, userId string) error
	GetMessage(channeId string, cursor string, receiverType string) ([]models.Message, error)
	GetUsers(channelId string, workspaceId string) ([]models.User, error)
	FetchWorkspaceUsers(workspaceId string) ([]models.User, error)
	AddUserToChannel(userId string, channelId string, workspaceId string, actionPerformerId string) error
}

// One property that is called repo
type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

type WorkspaceWithChannels struct {
	Workspace models.Workspace
	Channels  []models.Channels
}

func (s *service) GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error) {
	// Fetch al workspaces
	workspaces, err := s.repo.GetWorspaceByUserId(userId)
	if err != nil {
		return nil, err
	}

	// Results silce tp hold results
	var results []WorkspaceWithChannels

	for _, ws := range workspaces {
		channels, err := s.repo.GetChannelsByWorkspace(ws.ID.String())
		if err != nil {
			return nil, err
		}
		results = append(results, WorkspaceWithChannels{
			Workspace: ws,
			Channels:  channels,
		})
	}

	return results, nil
}

// Retursn Workspace Name, worspace created date Owner Details (Name and email) and
func (s *service) GetWorkspaceDetails(wsId string) (WorkspaceDetails, error) {

	workspaceDetails, err := s.repo.GetWorkspaceDetails(wsId)
	if err != nil {
		return WorkspaceDetails{}, err
	}

	return workspaceDetails, err
}

func (s *service) GetMembers(wsId string) ([]UserInfoInWorkspace, error) {
	data, err := s.repo.GetWorkspaceMembers(wsId)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (s *service) LeaveWorkspace(wsId string, userId string) error {
	err := s.repo.LeaveWorkspace(wsId, userId)
	if err != nil {
		return err
	}
	return nil
}

func (s *service) DeleteWorkspace(wsId string, userId string) error {
	role, err := s.repo.GetRole(userId, wsId)
	if err != nil {
		return err
	}

	log.Println("Role of the user", role)
	if role != "owner" {
		log.Println("The role of the performer", role)
		return errors.New("only creator can delete")
	}

	err = s.repo.DeleteWorkspace(wsId)

	if err != nil {
		return err
	}

	return nil
}

func (s *service) GetMessage(channelId string, cursor string, receiverType string) ([]models.Message, error) {
	if channelId == "" || receiverType == "" {
		return nil, errors.New("channelId or receiver type is empty")
	}

	var parsedCursor *time.Time
	var err error

	cursor = strings.Trim(cursor, `"`)

	if cursor != "" {
		t, err := time.Parse(time.RFC3339, cursor)
		if err != nil {
			return nil, err
		}
		parsedCursor = &t
	}

	messages, err := s.repo.GetMessages(channelId, parsedCursor, receiverType)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (s *service) GetUsers(channelId string, workspaceId string) ([]models.User, error) {
	if channelId != "" {
		users, err := s.repo.GetChannelUsers(channelId)
		if err != nil {
			return nil, err
		}
		return users, nil
	}

	if workspaceId != "" {
		users, err := s.repo.GetWorkspaceUsers(workspaceId)
		if err != nil {
			log.Println("Error occuring while fetching public users: ", err)
			return nil, err
		}
		return users, nil
	}

	return nil, errors.New("provide channel id or workspace id")
}

func (s *service) FetchWorkspaceUsers(workspaceId string) ([]models.User, error) {
	data, err := s.repo.FetchWorkspaceUsers(workspaceId)
	if err != nil {
		log.Print("Error while fetchng the users from database", err)
		return []models.User{}, err
	}
	return data, nil
}

func (s *service) AddUserToChannel(userId string, channelId string, workspaceId string, actionPerformerId string) error {

	role, err := s.repo.GetRole(actionPerformerId, workspaceId)
	if err != nil {
		return err
	}

	if role != "owner" && role != "admin" {
		return fmt.Errorf("role '%s' is not allowed to add users to channels", role)

	}

	err = s.repo.AddUserToChannel(userId, channelId)
	if err != nil {
		return err
	}
	return nil
}
