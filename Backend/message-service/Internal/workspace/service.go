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
	Workspace models.Workspace
	Channels  []ChannelWithMessages
}

type ChannelWithMessages struct {
	Channel  models.Channels
	Messages []models.Message
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

		var channelsWithMessages []ChannelWithMessages
		for _, ch := range channels {
			messages, err := s.repo.GetChannelsMessages(ch.ID.String())
			if err != nil {
				return nil, err
			}

			channelsWithMessages = append(channelsWithMessages, ChannelWithMessages{
				Channel:  ch,
				Messages: messages,
			})

		}
		results = append(results, WorkspaceWithChannels{
			Workspace: ws,
			Channels:  channelsWithMessages,
		})
	}

	return results, nil

}
