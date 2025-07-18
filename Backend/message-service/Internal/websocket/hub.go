package websocket

type Hub struct {
	clients    map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan broadcastMessage
}

type broadcastMessage struct {
	channelID string
	data      interface{}
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan broadcastMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if h.clients[client.channelID] == nil {
				h.clients[client.channelID] = make(map[*Client]bool)
			}
			h.clients[client.channelID][client] = true
		case client := <-h.unregister:
			if clients, ok := h.clients[client.channelID]; ok {
				delete(clients, client)
				close(client.send)
			}

		case message := <-h.broadcast:
			if clients, ok := h.clients[message.channelID]; ok {
				for client := range clients {
					client.send <- message.data
				}
			}
		}
	}
}

func (h *Hub) BroadcastToChannel(channelId string, data interface{}) {
	h.broadcast <- broadcastMessage{channelID: channelId, data: data}
}
