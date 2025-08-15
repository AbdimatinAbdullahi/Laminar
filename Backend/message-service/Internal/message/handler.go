package message

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"

	"laminar/internal/config"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)

var jwtSecret = []byte(config.Load().SECRET_KEY)

func getUserFromToken(r *http.Request) (string, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return "", errors.New("authorization missing")
	}

	parts := strings.Split(authHeader, "Bearer ")
	if len(parts) != 2 {
		return "", errors.New("invalid authorization header format")
	}

	tokenStr := parts[1]

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing methods")
		}
		return jwtSecret, nil
	})

	if err != nil {
		log.Println("Invalid Token error: ", err)
		return "", errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("could not parse claims")
	}

	userId, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("user id claim not found")
	}

	return userId, nil
}

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

	channel, err := h.scv.CreateChannel(req.Channelname, req.CreatorId, req.IsPrivate, req.WorkspaceId)
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

func (h *Handler) ValidateUser(w http.ResponseWriter, r *http.Request) {
	userId, err := getUserFromToken(r)
	if userId == "" {
		http.Error(w, "invalid header", http.StatusExpectationFailed)
		return
	}
	channelId := r.URL.Query().Get("channelId")

	log.Println("Channel Id", channelId)
	log.Println("user Id", userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	exists, err := h.scv.ValidatePrivateUser(userId, channelId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(exists)

}
