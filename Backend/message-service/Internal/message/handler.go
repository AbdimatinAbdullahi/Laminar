package message

import (
	"encoding/json"
	"fmt"
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
		Send:           make(chan interface{}),
		Services:       h.scv,
	}

	go user.ReadMessage()
	go user.WriteMessage()
}

func (h *Handler) GetPresgnedURL(w http.ResponseWriter, r *http.Request) {
	fileName := r.URL.Query().Get("filename")
	contentType := r.URL.Query().Get("filetype")

	fmt.Println("This methods is", r.Method)
	fmt.Println("The file content type: ", contentType)

	if fileName == "" || contentType == "" {
		http.Error(w, "filename and content type cannot be empty", http.StatusInternalServerError)
		return
	}

	uploadUrl, cloudfronturl, err := h.scv.GeneratePresignedURLL(fileName, contentType)
	if err != nil {
		http.Error(w, "error while genrating s3 key", http.StatusInternalServerError)
	}

	json.NewEncoder(w).Encode(map[string]string{
		"upload_url": uploadUrl,
		"cfrURL":     cloudfronturl,
	})

}
