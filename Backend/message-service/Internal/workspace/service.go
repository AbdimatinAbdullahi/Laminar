package workspace

import (
	"errors"
	"laminar/internal/models"
	"log"
)

type Service interface {
	GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error)
	GetWorkspaceDetails(wsId string) (WorkspaceDetails, error)
	GetMembers(wsId string) ([]UserInfoInWorkspace, error)
	LeaveWorkspace(wsId string, userId string) error
	DeleteWorkspace(wsId string, userId string) error
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
