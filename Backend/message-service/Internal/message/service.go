package message

import (
	"context"
	"laminar/internal/models"
)

type Service interface {
	SaveMessage(ctx context.Context, msg *models.Message) error
	NewReaction(msgId string, reactorId string, emoji string) error
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
func (s *service) NewReaction(msgid string, reactorId string, emoji string) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	err := s.repo.NewReaction(ctx, msgid, reactorId, emoji)
	if err != nil {
		return err
	}
	return nil
}
