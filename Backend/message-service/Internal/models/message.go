package models

import (
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Attachment struct {
	Type string `bson:"type" json:"type"`
	URL  string `bson:"url" json:"url"`
	Name string `bson:"name" json:"name"`
}

type Reaction struct {
	UserID   uuid.UUID `bson:"user_id" json:"user_id"`
	Reaction string    `bson:"reaction" json:"reaction"`
}

type MessageContent struct {
	Text       string       `bson:"text" json:"text"`
	Attachment []Attachment `bson:"attachment,omitempty" json:"attachments,omitempty"`
}

type Message struct {
	ID             primitive.ObjectID  `bson:"_id,omitempty" json:"id"`
	SenderID       uuid.UUID           `bson:"sender_id" json:"sender_id"`
	ReceiverType   string              `bson:"receiver_type" json:"receiver_type"`
	ReceiverID     uuid.UUID           `bson:"receiver_id" json:"receiver_id"`
	Content        MessageContent      `bson:"content" json:"content"`
	Timestamp      time.Time           `bson:"timestamp" json:"timestamp"`
	Edited         bool                `bson:"edited" json:"edited"`
	Reactions      []Reaction          `bson:"reactions,omitempty" json:"reactions,omitempty"`
	ThreadParentID *primitive.ObjectID `bson:"thread_parent_id,omitempty" json:"thread_parent_id,omitempty"`
	Sender         *User
}
