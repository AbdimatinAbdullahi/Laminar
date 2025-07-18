package message

import (
	"context"
	"laminar/internal/models"
)

type Service interface {
	SaveMessage(ctx context.Context, msg *models.Message) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) SaveMessage(ctx context.Context, msg *models.Message) error {
	return nil
}
