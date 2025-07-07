package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Workspace struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(255);not null" json:"name"`
	OwnerID   uuid.UUID `gorm:"type:uuid; not null" json:"owner_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

type WorkspaceMemberships struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	WorkspaceID uuid.UUID `gorm:"type:uuid;not null" json:"workspace_id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Role        string    `gorm:"type:varchar(20);not null" json:"role"`
	JoinedAt    time.Time `gorm:"autoCreateTime" json:"joined_at"`
}
type User struct {
	ID       uuid.UUID `json:"id" gorm:"column:id"`
	FullName string    `json:"fullname" gorm:"column:fullname"`
	Email    string    `json:"email" gorm:"column:email"`
}

// Gorm beforecreate lifecycle hook that checks if the w.ID is nill and if yes it generates new UUID and assigns it to w.ID
func (w *Workspace) BeforeCreate(tx *gorm.DB) (err error) {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return
}

func (ws *WorkspaceMemberships) BeforeCreate(tx *gorm.DB) (err error) {
	if ws.ID == uuid.Nil {
		ws.ID = uuid.New()
	}
	return
}

func (Workspace) TableName() string {
	return "workspaces"
}

func (WorkspaceMemberships) TableName() string {
	return "workspace_memberships"
}
