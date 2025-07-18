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

	if parsedCursor != nil {
		fmt.Println("Formted cursor: ", parsedCursor.Local().Format("01/02/2006, 03:05:05 PM"))
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
