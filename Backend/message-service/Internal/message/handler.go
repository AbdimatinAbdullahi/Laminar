package message

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Handler struct {
	scv Service
}

func NewHandler(service Service) *Handler {
	return &Handler{scv: service}
}

var NewServer = NewChatServer()

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Handler) HandleWebsocketConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("Websocket upgrade failed: ❌")
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	userId := r.URL.Query().Get("userId")
	log.Println("User id: ", userId)
	log.Println("Connection successfu,ll:")

	user := &UserConnection{
		UserID:         userId,
		Conn:           conn,
		Server:         NewServer,
		CurrentChannel: "",
		Send:           make(chan []byte),
		Services:       h.scv,
	}

	go user.ReadMessage()
	go user.WriteMessage()
}
