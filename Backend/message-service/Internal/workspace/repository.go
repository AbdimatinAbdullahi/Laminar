package workspace

import (
	"laminar/Internal/models"

	"gorm.io/gorm"
)

type Repository interface {
	GetWorspaceByUserId(userId string) ([]models.Workspace, error) // Later after advancments it can be slices of workspaces that user belongs to
	GetChannelsByWorkspace(workspaceId string) ([]models.Channels, error)
	GetWorspaceMmebers(workspaceId string) ([]models.WorkspaceMemberships, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db}
}

func (r *repository) GetWorspaceByUserId(userId string) ([]models.Workspace, error) {
	var workspaces []models.Workspace
	err := r.db.
		Joins("JOIN workspace_memberships wm ON wm.workspace_id = workspaces.id").
		Where("wm.user_id = ?", userId).
		Find(&workspaces).Error
	return workspaces, err
}

func (r *repository) GetChannelsByWorkspace(workspaceId string) ([]models.Channels, error) {
	var channels []models.Channels
	err := r.db.Where("workspace_id = ?", workspaceId).Find(&channels).Error
	return channels, err
}

func (r *repository) GetWorspaceMmebers(workspaceId string) ([]models.WorkspaceMemberships, error) {
	var members []models.WorkspaceMemberships
	err := r.db.Where("workspace_id = ?", workspaceId).Find(&members).Error
	return members, err
}
