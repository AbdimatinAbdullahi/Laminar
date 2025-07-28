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
	ID       string `json:"id" bson:"id"`
	Fullname string `json:"fullname" bson:"fullname"`
	Email    string `json:"email" bson:"email"`
}

type MessageContent struct {
	Text       string       `json:"text" bson:"text"`
	Attachment []Attachment `json:"attachment,omitempty" bson:"attachment,omitempty"`
}

type Attachment struct {
	Type string `json:"type" bson:"type"`
	URL  string `json:"url" bson:"url"`
	Name string `json:"name" bson:"name"`
}

type MessagePayload struct {
	ID           primitive.ObjectID `json:"id" bson:"_id"`
	Content      MessageContent     `json:"content" bson:"content"`
	Timestamp    string             `json:"timestamp" bson:"timestamp"`
	SenderID     string             `json:"sender_id" bson:"sender_id"`
	ReceiverType string             `json:"receiver_type" bson:"receiver_type"`
	ReceiverID   string             `json:"receiver_id" bson:"receiver_id"`
	Edited       bool               `json:"edited" bson:"edited"`
	Sender       SenderInfo         `json:"Sender" bson:"Sender"`
}

type Message struct {
	Type    string         `json:"type" bson:"type"`
	Payload MessagePayload `json:"payload" bson:"payload"`
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func NewMessagePayload(input Message) Message {
	input.Payload.Edited = false
	return input
}

func (s *service) SaveMessage(ctx context.Context, msg []byte) (Message, error) {
	var message Message
	log.Println("The message is received")
	if err := json.Unmarshal(msg, &message); err != nil {
		log.Println("Error while unmarshaling the json data: ", err)
		return Message{}, err
	}
	newPayload := NewMessagePayload(message)
	payloadJSON, _ := json.MarshalIndent(newPayload, "", "  ")
	log.Println("📤 Final payload:", string(payloadJSON))
	err := s.repo.SaveMessageToDb(context.Background(), newPayload.Payload)
	if err != nil {
		log.Println("Somethinig went wrong while saving the data to db", err)
		return Message{}, err
	}
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
