package workspace

import "laminar/Internal/models"

type Repository interface {
	GetWorspaceByUserId(userId string) (*models.Workspace, error)
	GetChannelsByWorkspace(workspaceId string) ([]models.Channels, error)
	GetWorspaceMmebers(workspaceId string) ([]models.ChannelMemberships, error)
}
