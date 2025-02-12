package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"learning-go/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Permite todas as origens (não use isso em produção)
	},
}

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
}

func main() {
	r := gin.Default()

	// Configura o middleware CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Permite o frontend React
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Rotas CRUD
	r.GET("/ws", handleWebSocket)
	r.POST("/users", handlers.CreateUser)
	r.GET("/users", handlers.GetUsers)
	r.PUT("/users/:email", handlers.UpdateUser)
	r.DELETE("/users/:email", handlers.DeleteUser)

	//Rotas ToDo
	r.POST("/tasks", handlers.CreateTask)
	r.GET("/tasks", handlers.GetTasks)
	r.PUT("/tasks/:id", handlers.UpdateTask)
	r.DELETE("/tasks/:id", handlers.DeleteTask)

	// Inicia o servidor na porta 8080
	r.Run(":8080")
}

func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Falha ao abrir conexão WebSocket"})
		return
	}
	defer conn.Close()

	for {
		// Lê uma mensagem do cliente
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Erro ao ler mensagem:", err)
			break
		}

		// Envia uma resposta ao cliente
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println("Erro ao enviar mensagem:", err)
			break
		}
	}
}
