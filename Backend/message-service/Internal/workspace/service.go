package workspace

import "laminar/Internal/models"

type Service interface {
	GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error)
}

// One property that is called repo
type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

type WorkspaceWithChannels struct {
	Workspace models.Workspace  `json:"workspace"`
	Channels  []models.Channels `json:"channels"`
}

func (s *service) GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error) {
	workspaces, err := s.repo.GetWorspaceByUserId(userId)
	if err != nil {
		return nil, err
	}

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
