package main

import (
    "encoding/json"
    "log"
    "net/http"
)

// Struct to hold login data
type LoginRequest struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

func main() {
    http.HandleFunc("/api/login", loginHandler)
    
    log.Println("Server starting on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
    // Enable CORS
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
    w.Header().Set("Content-Type", "application/json")

    // Handle preflight
    if r.Method == "OPTIONS" {
        w.WriteHeader(http.StatusOK)
        return
    }

    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Read and decode the JSON body
    var loginData LoginRequest
    err := json.NewDecoder(r.Body).Decode(&loginData)
    if err != nil {
        log.Println("Error decoding JSON:", err)
        w.WriteHeader(http.StatusBadRequest)
        w.Write([]byte(`{"success":false,"message":"Invalid request"}`))
        return
    }

    // Log what we received
    log.Println("=== Login Attempt ===")
    log.Println("Username:", loginData.Username)
    log.Println("Password:", loginData.Password)
    log.Println("====================")

    // Send success response (for now, always succeeds)
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"success":true,"token":"demo-token-123","username":"` + loginData.Username + `"}`))
}