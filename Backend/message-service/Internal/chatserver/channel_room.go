package chatserver

import (
	"encoding/json"
	"log"
)

type ChannelRoom struct {
	ChannelID            string
	Members              map[*UserConnection]bool
	Join                 chan *UserConnection
	Leave                chan *UserConnection
	BroadcastMessage     chan []byte
	BroadcastReaction    chan []byte
	BroadcastMessageEdit chan []byte
	TypingEvent          chan TypingStatus
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
			log.Println("User joined: ", user.UserID)
			log.Println("User joined room: ", room.ChannelID)
			room.Members[user] = true

		case user := <-room.Leave:
			log.Println("User left the channel: ", user.UserID)
			log.Println("User left the room: ", room.ChannelID)
			delete(room.Members, user)

		case message := <-room.BroadcastMessage: // getting the message from the BroadcastMessage Channel
			room.broadcastMessage(message)

		case reaction := <-room.BroadcastReaction:
			room.broadcastReaction(reaction)

		case edit_message := <-room.BroadcastMessageEdit:
			room.broadcastEdit(edit_message)
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

func (room *ChannelRoom) broadcastMessage(msg []byte) {
	for user := range room.Members {
		user.Send <- msg
	}
}

func (room *ChannelRoom) broadcastReaction(reaction []byte) {
	for user := range room.Members {
		user.Send <- reaction
	}
}

func (room *ChannelRoom) broadcastEdit(msg []byte) {
	for user := range room.Members {
		user.Send <- msg
	}
}
