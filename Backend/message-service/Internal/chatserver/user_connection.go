package chatserver

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
}

func (u *UserConnection) ReadMessage() {
	defer func() {
		u.Server.RemoveUserFromChannel(u)
		u.Conn.Close()
	}()

	for {
		_, msg, err := u.Conn.ReadMessage()
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
				ChannelId string
			}
			json.Unmarshal(incoming.Data, &payload)
			u.Server.JoinChannel(payload.ChannelId, u)

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
