package websocket

import "encoding/json"

type ChannelRoom struct {
	ChannelID   string
	Members     map[*UserConnection]bool
	Join        chan *UserConnection
	Leave       chan *UserConnection
	Broadcast   chan []byte
	TypingEvent chan TypingStatus
}

type TypingStatus struct {
	UserID    string
	ChannelID string
	IsTyping  bool
}

func (room *ChannelRoom) Run() {
	for {
		select {
		case user := <-room.Join:
			room.Members[user] = true

		case user := <-room.Leave:
			delete(room.Members, user)

		case msg := <-room.Broadcast:
			for user := range room.Members {
				user.Send <- msg
			}

		case typing := <-room.TypingEvent:
			payload, _ := json.Marshal(struct {
				Type string       `json:"type"`
				Data TypingStatus `json:"data"`
			}{"typing", typing})
			for u := range room.Members {
				if u.UserID != typing.UserID { // don’t notify yourself
					u.Send <- payload
				}
			}
		}
	}
}
