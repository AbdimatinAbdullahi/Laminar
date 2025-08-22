package workspace

import (
	"errors"
	"fmt"
	"laminar/internal/config"
	"laminar/internal/models"
	"log"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Service interface {
	GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error)
	GetWorkspaceDetails(wsId string) (WorkspaceDetails, error)
	GetMembers(wsId string) ([]UserInfoInWorkspace, error)
	LeaveWorkspace(wsId string, userId string) error
	DeleteWorkspace(wsId string, userId string) error
	GetMessage(channeId string, cursor string, receiverType string) ([]models.Message, error)
	GetUsers(channelId string, workspaceId string) ([]models.User, error)
	FetchWorkspaceUsers(workspaceId string) ([]models.User, error)
	AddUserToChannel(userId string, channelId string, workspaceId string, actionPerformerId string) error
	CreateInvitations(email string, workspaceId string, role string) (*models.WorkspaceInvitations, error)
	AcceptInvitation(token string, email string) (bool, error)
	RemoveUserFromWorkspace(email string) error
}

// One property that is called repo
type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo}
}

type WorkspaceWithChannels struct {
	Workspace models.Workspace
	Channels  []models.Channels
}

func (s *service) GetUserWorkspaceAndChannels(userId string) ([]WorkspaceWithChannels, error) {
	// Fetch al workspaces
	workspaces, err := s.repo.GetWorspaceByUserId(userId)
	if err != nil {
		return nil, err
	}

	// Results silce tp hold results
	var results []WorkspaceWithChannels

	for _, ws := range workspaces {
		channels, err := s.repo.GetChannelsByWorkspace(ws.ID.String())
		if err != nil {
			return nil, err
		}
		results = append(results, WorkspaceWithChannels{
			Workspace: ws,
			Channels:  channels,
		})
	}

	return results, nil
}

// Retursn Workspace Name, worspace created date Owner Details (Name and email) and
func (s *service) GetWorkspaceDetails(wsId string) (WorkspaceDetails, error) {

	workspaceDetails, err := s.repo.GetWorkspaceDetails(wsId)
	if err != nil {
		return WorkspaceDetails{}, err
	}

	return workspaceDetails, err
}

func (s *service) GetMembers(wsId string) ([]UserInfoInWorkspace, error) {
	data, err := s.repo.GetWorkspaceMembers(wsId)
	if err != nil {
		return nil, err
	}

	return data, nil
}

func (s *service) LeaveWorkspace(wsId string, userId string) error {
	err := s.repo.LeaveWorkspace(wsId, userId)
	if err != nil {
		return err
	}
	return nil
}

func (s *service) DeleteWorkspace(wsId string, userId string) error {
	role, err := s.repo.GetRole(userId, wsId)
	if err != nil {
		return err
	}

	log.Println("Role of the user", role)
	if role != "owner" {
		log.Println("The role of the performer", role)
		return errors.New("only creator can delete")
	}

	err = s.repo.DeleteWorkspace(wsId)

	if err != nil {
		return err
	}

	return nil
}

func (s *service) GetMessage(channelId string, cursor string, receiverType string) ([]models.Message, error) {
	if channelId == "" || receiverType == "" {
		return nil, errors.New("channelId or receiver type is empty")
	}

	var parsedCursor *time.Time
	var err error

	cursor = strings.Trim(cursor, `"`)

	if cursor != "" {
		t, err := time.Parse(time.RFC3339, cursor)
		if err != nil {
			return nil, err
		}
		parsedCursor = &t
	}

	messages, err := s.repo.GetMessages(channelId, parsedCursor, receiverType)
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (s *service) GetUsers(channelId string, workspaceId string) ([]models.User, error) {
	if channelId != "" {
		users, err := s.repo.GetChannelUsers(channelId)
		if err != nil {
			return nil, err
		}
		return users, nil
	}

	if workspaceId != "" {
		users, err := s.repo.GetWorkspaceUsers(workspaceId)
		if err != nil {
			log.Println("Error occuring while fetching public users: ", err)
			return nil, err
		}
		return users, nil
	}

	return nil, errors.New("provide channel id or workspace id")
}

func (s *service) FetchWorkspaceUsers(workspaceId string) ([]models.User, error) {
	data, err := s.repo.FetchWorkspaceUsers(workspaceId)
	if err != nil {
		log.Print("Error while fetchng the users from database", err)
		return []models.User{}, err
	}
	return data, nil
}

func (s *service) AddUserToChannel(userId string, channelId string, workspaceId string, actionPerformerId string) error {

	role, err := s.repo.GetRole(actionPerformerId, workspaceId)
	if err != nil {
		return err
	}

	if role != "owner" && role != "admin" {
		return fmt.Errorf("role '%s' is not allowed to add users to channels", role)

	}

	err = s.repo.AddUserToChannel(userId, channelId)
	if err != nil {
		return err
	}
	return nil
}

func (s *service) CreateInvitations(email string, workspaceId string, role string) (*models.WorkspaceInvitations, error) {
	token, err := GenerateToken(email, workspaceId, role)
	if err != nil {
		return &models.WorkspaceInvitations{}, fmt.Errorf("error while generating token: %v", err)
	}

	log.Println("Role: ", role)

	invitation, err := s.repo.CreateInvitations(email, workspaceId, token, role)
	if err != nil {
		return &models.WorkspaceInvitations{}, err
	}

	// send a token via and email

	return invitation, nil
}

func (s *service) AcceptInvitation(token string, email string) (bool, error) {

	claims, err := GetClaimsFromToken(token)

	if err != nil {
		return false, fmt.Errorf("error while getting claims from token: %v", err)
	}

	tokenEmail, ok := claims["email"].(string)
	if !ok || tokenEmail != email {
		log.Println("Email from the claims: ", tokenEmail)
		log.Println("Email from the user: ", email)
		return false, fmt.Errorf("email do not match")
	}

	workspaceId, ok := claims["workspaceId"].(string)
	if !ok {
		log.Println("Workspace id: ", workspaceId)
		return false, fmt.Errorf("Workspace id not available")
	}

	role, ok := claims["role"].(string)
	if !ok {
		log.Println("Role not availanle", role)
		return false, fmt.Errorf("role not available in claims")
	}

	err = s.repo.AcceptInvitation(tokenEmail, workspaceId, role)
	if err != nil {
		log.Println("Error while working on invitation database: ", err)
		return false, err
	}

	return true, nil
}

func GenerateToken(email string, workspaceId string, role string) (string, error) {
	secretKey := []byte(config.Load().SECRET_KEY)
	log.Println("Secret key for signing the token: ", secretKey)

	// Define claims or payload
	claims := jwt.MapClaims{
		"email":       email,
		"workspaceId": workspaceId,
		"role":        role,
		"iat":         time.Now().Unix(),
		"exp":         time.Now().Add(time.Hour * 3 * 24).Unix(),
	}

	// create a token object
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	log.Println("Token header: ", token.Header)
	log.Println("Token claims: ", token.Claims)

	// sign thr token with scret key
	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil

}

func GetClaimsFromToken(tokenString string) (jwt.MapClaims, error) {
	secretKey := []byte(config.Load().SECRET_KEY)

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return secretKey, nil
	})

	if err != nil {
		log.Println("Error decoding the token: ", err)
		return nil, err
	}

	if !token.Valid {
		log.Println("Invalid tokens: ", err)
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		log.Println("Invalid claims: ", err)
		return nil, fmt.Errorf("invalid claims")
	}

	if exp, ok := claims["exp"].(float64); !ok && int(exp) < int(time.Now().Unix()) {
		log.Println("Tokens expired: ", err)
		return nil, fmt.Errorf("token expired")
	}

	return claims, nil

}

func (s *service) RemoveUserFromWorkspace(email string) error {

	err := s.repo.RemoveUserFromWorkspace(email)
	if err != nil {
		return err
	}

	return nil
}
