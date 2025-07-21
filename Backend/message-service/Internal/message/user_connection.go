package message

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type UserConnection struct {
	UserID         string
	Conn           *websocket.Conn
	CurrentChannel string
	Send           chan []byte
	Server         *ChatServer
	Services       Service
}

func (u *UserConnection) ReadMessage() {
	defer func() {
		u.Server.RemoveUserFromChannel(u)
		u.Conn.Close()
	}()

	for {
		_, msg, err := u.Conn.ReadMessage()
		log.Println("Reading the message from connection: ", string(msg))
		if err != nil {
			break
		}
		// Temp storage to decode the outer layer of incoming json and that is msg
		var incoming struct {
			Type string
			Data json.RawMessage
		}

		json.Unmarshal(msg, &incoming)

		switch incoming.Type {
		case "join":
			var payload struct {
				ChannelID string
				UserID    string
			}
			json.Unmarshal(incoming.Data, &payload)
			u.Server.JoinChannel(payload.ChannelID, u)

		case "message":
			room := u.Server.GetChannelRoom(u.CurrentChannel)

			if room != nil {
				room.BroadcastMessage <- msg
			}

		case "typing":
			var typing TypingStatus
			json.Unmarshal(incoming.Data, &typing)
			room := u.Server.GetChannelRoom(u.CurrentChannel)
			if room != nil {
				room.TypingEvent <- typing
			}

		case "edit_message":
			room := u.Server.GetChannelRoom(u.CurrentChannel)
			if room != nil {
				room.BroadcastMessage <- msg
			}

		case "reaction":
			room := u.Server.GetChannelRoom(u.CurrentChannel)
			var payload struct {
				MessageId string
				ReactorId string
				Emoji     string
			}
			json.Unmarshal(incoming.Data, &payload)
			log.Println("The incoming data for reaction: ", payload)
			err := u.Services.NewReaction(payload.MessageId, payload.ReactorId, payload.Emoji)
			if err != nil {
				log.Fatalln("Failed to save to db the reaction: ", err)
			}
			if room != nil {
				room.BroadcastReaction <- msg
			}
		}
	}
}

func (u *UserConnection) WriteMessage() {

	defer func() {
		u.Conn.Close()
	}()

	for msg := range u.Send {
		err := u.Conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			log.Println("Error occuring while writing: ", err)
			return
		}
	}

}
