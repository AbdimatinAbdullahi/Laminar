package websocket

import (
	"net/http"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn      *websocket.Conn
	send      chan interface{}
	hub       *Hub
	channelID string
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewClient(hub *Hub, w http.ResponseWriter, r *http.Request) *Client {
	conn, _ := upgrader.Upgrade(w, r, nil)
	channelId := r.URL.Query().Get("channelID")
	client := &Client{
		conn:      conn,
		send:      make(chan interface{}),
		hub:       hub,
		channelID: channelId,
	}
	hub.register <- client
	return client
}

func (c *Client) ReadPump(onMessage func([]byte)) {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		onMessage(message)
	}
}

func (c *Client) WritePupm() {
	for msg := range c.send {
		c.conn.WriteJSON(msg)
	}
}
