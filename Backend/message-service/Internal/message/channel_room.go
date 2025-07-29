package message

import (
	"encoding/json"
	"log"
)

type ChannelRoom struct {
	ChannelID              string
	Members                map[*UserConnection]bool
	Join                   chan *UserConnection
	Leave                  chan *UserConnection
	BroadcastMessage       chan interface{}
	BroadcastReaction      chan interface{}
	BroadcastMessageEdit   chan interface{}
	BroadCastDeleteMessage chan interface{}
	TypingEvent            chan TypingStatus
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

		case message := <-room.BroadcastMessage: // getting the message from the BroadcastMessage Channel
			room.broadcastMessage(message)

		case reaction := <-room.BroadcastReaction:
			room.broadcastReaction(reaction)

		case edit_message := <-room.BroadcastMessageEdit:
			room.broadcastEdit(edit_message)

		case delete_message := <-room.BroadCastDeleteMessage:
			room.broadcastDelete(delete_message)

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

func (room *ChannelRoom) broadcastMessage(msg interface{}) {
	for user := range room.Members {
		user.Send <- msg
	}
}

func (room *ChannelRoom) broadcastReaction(reaction interface{}) {
	log.Println("Reaction: ", reaction)
	for user := range room.Members {
		user.Send <- reaction
	}
}

func (room *ChannelRoom) broadcastEdit(msg interface{}) {
	for user := range room.Members {
		user.Send <- msg
	}
}

func (room *ChannelRoom) broadcastDelete(msg interface{}) {
	log.Println("Delete message: ", msg)
	for user := range room.Members {
		user.Send <- msg
	}
}
