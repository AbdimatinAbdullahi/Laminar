package message

import (
	"context"
	"encoding/json"
	"laminar/internal/models"
	"log"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service interface {
	SaveMessage(ctx context.Context, msg []byte) (Message, error)
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

type MessageContent struct {
	Text       string       `json:"text"`
	Attachment []Attachment `json:"attachment,omitempty"`
}

type Attachment struct {
	Type string `json:"type"`
	URL  string `json:"url"`
	Name string `json:"name"`
}

type MessagePayload struct {
	ID           primitive.ObjectID `json:"id"`
	Content      MessageContent     `json:"content"`
	Timestamp    string             `json:"timestamp"`
	SenderID     string             `json:"sender_id"`
	ReceiverType string             `json:"receiver_type"`
	ReceiverID   string             `json:"receiver_id"`
	Sender       SenderInfo         `json:"sender"`
}

type Message struct {
	Type    string         `json:"type"`
	Payload MessagePayload `json:"payload"`
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func NewMessagePayload(input Message) Message {
	if input.Payload.ID.IsZero() {
		input.Payload.ID = primitive.NewObjectID()
	}
	return input
}

func (s *service) SaveMessage(ctx context.Context, msg []byte) (Message, error) {
	var message Message
	log.Println("The message is received")
	if err := json.Unmarshal(msg, &message); err != nil {
		log.Println("Error while unmarshaling the json data: ", err)
		return Message{}, nil
	}
	newPayload := NewMessagePayload(message)
	return newPayload, nil
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
