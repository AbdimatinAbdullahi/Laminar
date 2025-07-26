package message

import (
	"context"
	"encoding/json"
	"laminar/internal/models"
	"log"
)

type Service interface {
	SaveMessage(ctx context.Context, msg []byte) error
	NewReaction(msgId string, reactorId string, emoji string) error
	LogTheMessageFormat(msg []byte) (*models.Message, error)
}

type service struct {
	repo Repository
}

type SenderInfo struct {
	ID       string `json:"id"`
	Fullname string `json:"fullname"`
	Email    string `json:"email"`
}

type MessagePayload struct {
	Text         string     `json:"text"`
	Timestamp    string     `json:"timestamp"`
	SenderID     string     `json:"sender_id"`
	ReceiverType string     `json:"receiver_type"`
	ReceiverID   string     `json:"receiver_id"`
	Sender       SenderInfo `json:"sender"`
}

type Message struct {
	Type    string         `json:"type"`
	Payload MessagePayload `json:"payload"`
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) SaveMessage(ctx context.Context, msg []byte) error {
	var message Message
	if err := json.Unmarshal(msg, &message); err != nil {
		log.Println("Error while unmarshaling the json data: ", err)
	}

	log.Println("The incoming: ", message)

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

func (s *service) LogTheMessageFormat(msg []byte) (*models.Message, error) {
	return nil, nil
}
