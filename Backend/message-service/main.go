package main

import (
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
	if err := db.InitPostgres(); err != nil {
		log.Fatalf("Error initializinf db connection : %v", err)
		os.Exit(1)
	}

	defer db.ClosePostgres()

	// db.AutoMigrateTables()

	gormDB := db.GetPostgresDB()

	workspaceRepo := workspace.NewRepository(gormDB)
	workspaceSvc := workspace.NewService(workspaceRepo)
	workspaceHandler := workspace.NewHandler(workspaceSvc)

	http.Handle("/workspace", corsMiddleware(http.HandlerFunc(workspaceHandler.GetWorkspaceAndChannels)))
	log.Println("Server running :8008")
	http.ListenAndServe(":8008", nil)

}
