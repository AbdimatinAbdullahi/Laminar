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

func (h *Handler) GetParentMessage(w http.ResponseWriter, r *http.Request) {
	parentId := r.URL.Query().Get("parentMessageId")
	log.Println("Got the parentMessageId: ", parentId)
	data, err := h.scv.GetParentMessage(parentId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	json.NewEncoder(w).Encode(data)
}

func (h *Handler) CreateChannel(w http.ResponseWriter, r *http.Request) {

	type CreateChannelRequest struct {
		Channelname string `json:"channelname"`
		CreatorId   string `json:"creatorId"`
		WorkspaceId string `json:"workspaceId"`
		IsPrivate   bool   `json:"isprivate"`
	}

	var req CreateChannelRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	channel, err := h.scv.CreateChannel(req.Channelname, req.WorkspaceId, req.IsPrivate, req.CreatorId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	json.NewEncoder(w).Encode(&channel)

}

func (h *Handler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	type CreateWorkspaceRequest struct {
		WorkspaceName string `json:"workspaceName"`
		UserID        string `json:"userId"`
	}

	var reqest CreateWorkspaceRequest

	err := json.NewDecoder(r.Body).Decode(&reqest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("Printing function reaching the backend: ", reqest)

	workspace, err := h.scv.CreateWorkspace(reqest.WorkspaceName, reqest.UserID)
	if err != nil {
		log.Println("Error while creating workspace", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	json.NewEncoder(w).Encode(&workspace)
}
