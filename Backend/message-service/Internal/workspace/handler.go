package workspace

import (
	"encoding/json"
	"errors"
	"fmt"
	"laminar/internal/config"
	"log"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc}
}

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

	log.Println("Token", tokenStr)

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

func (h *Handler) GetWorkspaceAndChannels(w http.ResponseWriter, r *http.Request) {
	userId, err := getUserFromToken(r)

	if err != nil {
		http.Error(w, "Unauthorised: "+err.Error(), http.StatusUnauthorized)
		return
	}

	data, err := h.svc.GetUserWorkspaceAndChannels(userId)
	if err != nil {
		http.Error(w, "Failed to load workspaces", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) GetWorkspaceDetailsHandler(w http.ResponseWriter, r *http.Request) {
	wsId := r.URL.Query().Get("wsId")

	if wsId == "" {
		http.Error(w, "Missing workspace id", http.StatusBadRequest)
		return
	}

	data, err := h.svc.GetWorkspaceDetails(wsId)

	if err != nil {
		fmt.Println("Error Querying the workspace details", err)
		http.Error(w, "Iinternal Server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) GetWorkspaceMembers(w http.ResponseWriter, r *http.Request) {
	wsId := r.URL.Query().Get("wsId")
	if wsId == "" {
		http.Error(w, "Missing id ", http.StatusBadRequest)
	}

	data, err := h.svc.GetMembers(wsId)
	if err != nil {
		http.Error(w, "Internal Server error", http.StatusBadRequest)
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&data)
}

func (h *Handler) LeaveWorkspace(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	workspaceId := r.URL.Query().Get("workspaceId")

	if userId == "" || workspaceId == "" {
		http.Error(w, "Missing workspace id or user id", http.StatusBadRequest)
		return
	}

	err := h.svc.LeaveWorkspace(workspaceId, userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte("User removed successful"))

}

func (h *Handler) DeleteWorkspace(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	workspaceId := r.URL.Query().Get("workspaceId")

	if userId == "" || workspaceId == "" {
		http.Error(w, "Missing user id and workspace id", http.StatusBadRequest)
		return
	}

	err := h.svc.DeleteWorkspace(workspaceId, userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte("Workspace deleted!"))

}

func (h *Handler) GetMessages(w http.ResponseWriter, r *http.Request) {
	channelId := r.URL.Query().Get("chatId")
	cursor := r.URL.Query().Get("before")
	receiverType := r.URL.Query().Get("type")

	log.Printf("Cusror in handler: %s\n", cursor)

	messages, err := h.svc.GetMessage(channelId, cursor, receiverType)

	if err != nil {
		log.Println("Error from handler", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&messages)
}

func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	channelId := r.URL.Query().Get("channelId")
	workspaceId := r.URL.Query().Get("spaceId")

	users, err := h.svc.GetUsers(channelId, workspaceId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&users)

}
