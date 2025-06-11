package main

import (
	"laminar/Internal/db"
	"log"
	"os"
)

func main() {
	if err := db.InitPostgres(); err != nil {
		log.Fatalf("Error initializinf db connection : %v", err)
		os.Exit(1)
	}

	defer db.ClosePostgres()

	// db.AutoMigrateTables()

}
