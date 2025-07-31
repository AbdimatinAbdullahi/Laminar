package message

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type UserConnection struct {
	UserID         string
	Conn           *websocket.Conn
	CurrentChannel string
	Send           chan interface{}
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
		if err != nil {
			break
		}
		// Temp storage to decode the outer layer of incoming json and that is msg
		var incoming struct {
			Type    string
			Payload json.RawMessage
		}

		json.Unmarshal(msg, &incoming)

		log.Println("The incoming request: ", string(msg))
		log.Println("The incoming request: ", string(incoming.Payload))

		switch incoming.Type {
		case "join":
			var payload struct {
				ChannelID string
				UserID    string
			}

			json.Unmarshal(incoming.Payload, &payload)

			u.Server.JoinChannel(payload.ChannelID, u)

		case "message":
			room := u.Server.GetChannelRoom(u.CurrentChannel)

			ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)

			defer cancel()

			payload, err := u.Services.SaveMessage(ctx, msg)

			if err != nil {
				fmt.Println("Error while saving data", err)
				return
			}

			if room != nil {
				room.BroadcastMessage <- payload
			}

		case "typing":
			var typing TypingStatus

			json.Unmarshal(incoming.Payload, &typing)

			room := u.Server.GetChannelRoom(u.CurrentChannel)

			if room != nil {
				room.TypingEvent <- typing
			}

		case "edit_message":

			room := u.Server.GetChannelRoom(u.CurrentChannel)

			var EditContent struct {
				MessageId  string
				NewContent string
				ChannelId  string
			}
			json.Unmarshal(incoming.Payload, &EditContent)

			log.Println("Printing the edit content: ", EditContent)

			err := u.Services.EditMessage(EditContent.MessageId, EditContent.NewContent)

			if err != nil {
				log.Fatalln("Eror while editing message: ", err)
				return
			}

			if room != nil {
				room.BroadcastMessage <- incoming
			}

		case "reaction":
			room := u.Server.GetChannelRoom(u.CurrentChannel)
			var payload struct {
				MessageId string
				ReactorId string
				Emoji     string
			}
			json.Unmarshal(incoming.Payload, &payload)
			err := u.Services.NewReaction(payload.MessageId, payload.ReactorId, payload.Emoji)
			if err != nil {
				log.Fatalln("Failed to save to db the reaction: ", err)
				return
			}
			if room != nil {
				room.BroadcastReaction <- incoming
			}

		case "delete_message":

			room := u.Server.GetChannelRoom(u.CurrentChannel)

			var payload struct {
				DelId string
			}

			json.Unmarshal(incoming.Payload, &payload)

			log.Println("Delete message data received: ", incoming)

			err := u.Services.DeleteMessage(payload.DelId)
			if err != nil {
				log.Println("Error while deleting message: ", err)
				return
			}

			if room != nil {
				room.BroadCastDeleteMessage <- incoming
			}

		}
	}
}

func (u *UserConnection) WriteMessage() {

	defer func() {
		u.Conn.Close()
	}()

	for msg := range u.Send {

		log.Println("Message to send received: ", msg)

		var data []byte
		var err error
		data, err = json.Marshal(msg)
		if err != nil {
			log.Println("Something went wrong while decoding the data into byte: ", err)
		}
		err = u.Conn.WriteMessage(websocket.TextMessage, data)
		if err != nil {
			log.Println("Error occuring while writing: ", err)
			return
		}
	}

}
