package main

import (
	"context"
	"laminar/Internal/db"
	"laminar/Internal/workspace"
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
	gormDB := db.GetPostgresDB()
	mongoDB := db.GetMongo()

	// Establishing dependecies for workspace package that is used to load workspace data like workspaces, channels and messages
	workspaceRepo := workspace.NewRepository(gormDB, mongoDB)
	workspaceSvc := workspace.NewService(workspaceRepo)
	workspaceHandler := workspace.NewHandler(workspaceSvc)

	http.Handle("/workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.GetWorkspaceAndChannels)))
	log.Println("Server running :8008")
	http.ListenAndServe(":8008", nil)

}
