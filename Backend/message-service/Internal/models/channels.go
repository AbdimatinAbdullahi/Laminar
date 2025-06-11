package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Channels struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"type:varchar(50);not null" json:"name"`
	WorkspaceID uuid.UUID `gorm:"type:uuid;not null" json:"workspace_id"`
	IsPrivate   bool      `gorm:"type:bool;not null" json:"is_private"`
	CreatedBy   uuid.UUID `gorm:"type:uuid;not null" json:"created_by"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type ChannelMemberships struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	ChannelID uuid.UUID `gorm:"type:uuid; not null" json:"channelID"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	JoinedAT  time.Time `gorm:"autoCreateTime" json:"joined_at"`
}

func (c *Channels) BeforeCreate(tx gorm.DB) (err error) {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return
}

func (ch *ChannelMemberships) BeforeCreate(tx gorm.DB) (err error) {
	if ch.ID == uuid.Nil {
		ch.ID = uuid.New()
	}
	return
}

func (Channels) TableName() string {
	return "channels"
}

func (ChannelMemberships) TableName() string {
	return "channel_memberships"
}
