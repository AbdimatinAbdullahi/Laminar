package message

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	Bucket = "my-laminar-bucket"
)

type Service interface {
	SaveMessage(ctx context.Context, msg []byte) (Message, error)
	NewReaction(msgId string, reactorId string, emoji string) error
	EditMessage(msgId string, newContent string) error
	DeleteMessage(msgId string) error
	GeneratePresignedURLL(filename string, contentType string) (s3url string, cloufrontURL string, err error)
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
	input.Payload.ID = primitive.NewObjectID()
	input.Payload.Edited = false
	return input
}

func (s *service) SaveMessage(ctx context.Context, msg []byte) (Message, error) {
	var message Message
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
	log.Println("Message Id: ", msgid)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	err := s.repo.NewReaction(ctx, msgid, reactorId, emoji)
	if err != nil {
		return err
	}
	return nil
}

func (s *service) EditMessage(msgId string, newContent string) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Println("Editing message on db")
	err := s.repo.EditMessage(ctx, msgId, newContent)
	if err != nil {
		return err
	}
	return nil
}

func (s *service) DeleteMessage(msgId string) error {
	objectMsgId, err := primitive.ObjectIDFromHex(msgId)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = s.repo.DeleteMessage(ctx, objectMsgId)
	if err != nil {
		return err
	}
	return nil

}

func (s *service) GeneratePresignedURLL(filename string, contentType string) (s3url string, cloudfront string, err error) {

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("eu-north-1"))

	if err != nil {
		return "", "", err
	}

	s3Client := s3.NewFromConfig(cfg) // initializes authenticated s3 client that talks to s3 service

	key := fmt.Sprintf("uploads/%d_%s", time.Now().Unix(), filename)
	// fmt.Println("The key printed is: ", key)

	presigner := s3.NewPresignClient(s3Client) //special client to generate presigned urls

	presignedReq, err := presigner.PresignPutObject(
		context.TODO(),
		&s3.PutObjectInput{
			Key:         &key,
			Bucket:      &Bucket,
			ContentType: &contentType,
		}, s3.WithPresignExpires(15*time.Minute))

	if err != nil {
		fmt.Println("The error while getting the load url: ", err)
		return "", "", err
	}

	// fmt.Println("The upload url is this: ", presignedReq.URL)

	cloudfronturl := fmt.Sprintf("%s/%s", "https://dun1ggowjxx1h.cloudfront.net", key)
	fmt.Println("S3 key:", key)
	fmt.Println("Full CloudFront URL:", cloudfronturl)

	return presignedReq.URL, cloudfronturl, nil
}
