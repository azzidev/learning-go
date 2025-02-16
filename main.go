package main

import (
	"context"
	"log"
	"time"

	"learning-go/handlers"
	"learning-go/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func init() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI("mongodb://localhost:27017")
	var err error
	client, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Conectado ao MongoDB!")

	// Inicializa o handler
	handlers.Init(client)
	handlers.InitTasks(client)
	handlers.InitNotes(client)
}

func main() {
	r := gin.Default()

	// Configura o middleware CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Permite o frontend React
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Rotas CRUD
	r.POST("/users/login", handlers.LoginUser)
	r.POST("/users", middleware.AuthMiddleware(), handlers.CreateUser)
	r.GET("/users", middleware.AuthMiddleware(), handlers.GetUsers)
	r.PUT("/users/:email", middleware.AuthMiddleware(), handlers.UpdateUser)
	r.DELETE("/users/:email", middleware.AuthMiddleware(), handlers.DeleteUser)

	//Rotas ToDo
	r.POST("/tasks", handlers.CreateTask)
	r.GET("/tasks", handlers.GetTasks)
	r.PUT("/tasks/:id", handlers.UpdateTask)
	r.DELETE("/tasks/:id", handlers.DeleteTask)

	//Rotas Notes
	r.POST("/notes", handlers.CreateNotes)
	r.GET("/notes", handlers.GetNotes)
	r.PUT("/notes/:id", handlers.UpdateNotes)
	r.PUT("/notes/:id/status", handlers.UpdateStatusNotes)
	r.DELETE("/notes/:id", handlers.DeleteNotes)

	// Inicia o servidor na porta 8080
	r.Run(":8080")
}
