package main

import (
	"context"
	"laminar/Internal/db"
	"laminar/Internal/workspace"
	"laminar/internal/message"
	"log"
	"net/http"
	"os"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") // Adjust to match your React port
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {

	// Postgres database connectection
	if err := db.InitPostgres(); err != nil {
		log.Fatalf("Error initializinf db connection : %v", err)
		os.Exit(1)
	}

	// Mongo_db database connection

	if err := db.InitMongo(context.Background()); err != nil {
		log.Fatalf("Error connecting to mongo db: %v", err)
		os.Exit(1)
	}

	defer db.ClosePostgres()

	// db.AutoMigrateTables()
	// db.SeedMessages(context.Background())
	// db.AddReactionsToLastMessages(context.Background())
	gormDB := db.GetPostgresDB()
	mongoDB := db.GetMongo()

	// Establishing dependecies for workspace package that is used to load workspace data like workspaces, channels and messages
	workspaceRepo := workspace.NewRepository(gormDB, mongoDB)
	workspaceSvc := workspace.NewService(workspaceRepo)
	workspaceHandler := workspace.NewHandler(workspaceSvc)

	// Message service initialization
	messageRepo := message.NewRepository(gormDB, mongoDB)
	messageSVC := message.NewService(messageRepo)
	messageHandler := message.NewHandler(messageSVC)

	// Workspace services
	http.Handle("/workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.GetWorkspaceAndChannels)))
	http.Handle("/workspace-data", corsMiddleware(http.HandlerFunc(workspaceHandler.GetWorkspaceDetailsHandler)))
	http.Handle("/workspace-members", corsMiddleware(http.HandlerFunc(workspaceHandler.GetWorkspaceMembers)))
	http.Handle("/leave-workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.LeaveWorkspace)))
	http.Handle("/delete-workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.DeleteWorkspace)))
	http.Handle("/chat", corsMiddleware(http.HandlerFunc(workspaceHandler.GetMessages)))
	http.Handle("/users/workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.GetUsers)))
	http.Handle("/workspaceUsers", corsMiddleware(http.HandlerFunc(workspaceHandler.FetchWorkspaceUsers)))
	http.Handle("/add-user-to-channel", corsMiddleware(http.HandlerFunc(workspaceHandler.AddUserToTheChannel)))
	http.Handle("/invite-to-workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.CreateInvitations)))
	http.Handle("/join-workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.AcceptInvitation)))

	// Messaging service now
	http.Handle("/ws", corsMiddleware(http.HandlerFunc(messageHandler.HandleWebsocketConnection)))
	http.Handle("/fetch_parent_message", corsMiddleware(http.HandlerFunc(messageHandler.GetParentMessage)))
	http.Handle("/create-channel", corsMiddleware(http.HandlerFunc(messageHandler.CreateChannel)))
	http.Handle("/create-workspace", corsMiddleware(http.HandlerFunc(messageHandler.CreateWorkspace)))
	http.Handle("/validae_private_channel_user", corsMiddleware(http.HandlerFunc(messageHandler.ValidateUser)))
	http.Handle("/generate-presigned-url", corsMiddleware(http.HandlerFunc(messageHandler.GetPresgnedURL)))

	log.Println("Server running :8008")
	http.ListenAndServe(":8008", nil)

}
