package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Task struct {
	ID          primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	Description string             `json:"description" bson:"description"`
	Completed   bool               `json:"completed" bson:"completed"`
}

var taskCollection *mongo.Collection

func InitTasks(client *mongo.Client) {
	taskCollection = client.Database("testdb").Collection("tasks")
}

func CreateTask(c *gin.Context) {
	var task Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := taskCollection.InsertOne(context.Background(), task)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tarefa criada com sucesso!"})
}

func GetTasks(c *gin.Context) {
	var tasks []Task
	cursor, err := taskCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var task Task
		cursor.Decode(&task)
		tasks = append(tasks, task)
	}

	c.JSON(http.StatusOK, tasks)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")

	// Converte o ID de string para ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var task Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Filtra pelo _id convertido
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"description": task.Description, "completed": task.Completed}}

	_, err = taskCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tarefa atualizada com sucesso!"})
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")

	// Converte o ID de string para ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	filter := bson.M{"_id": objectID}
	_, err = taskCollection.DeleteOne(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tarefa excluída com sucesso!"})
}
