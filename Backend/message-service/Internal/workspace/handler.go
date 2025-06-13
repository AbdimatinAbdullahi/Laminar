package workspace

import (
	"encoding/json"
	"errors"
	"laminar/Internal/config"
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
