package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Note struct {
	ID     primitive.ObjectID `json:"_id" bson:"_id,omitempty"`
	Title  string             `json:"title" bson:"title"`
	Note   string             `json:"note" bson:"note"`
	Date   time.Time          `json:"date" bson:"date"`
	Status bool               `json:"status" bson:"status"`
}

var notesCollection *mongo.Collection

func InitNotes(client *mongo.Client) {
	notesCollection = client.Database("testdb").Collection("notes")
}

func CreateNotes(c *gin.Context) {
	var note Note
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := notesCollection.InsertOne(context.Background(), note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Nota criada com sucesso!"})
}

func GetNotes(c *gin.Context) {
	var notes []Note
	cursor, err := notesCollection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var note Note
		cursor.Decode(&note)
		notes = append(notes, note)
	}

	c.JSON(http.StatusOK, notes)
}

func UpdateNotes(c *gin.Context) {
	id := c.Param("id")

	// Converte o ID de string para ObjectID
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var note Note
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Filtra pelo _id convertido
	filter := bson.M{"_id": objectID}
	update := bson.M{"$set": bson.M{"title": note.Title, "note": note.Note, "date": note.Date, "status": note.Status}}

	_, err = notesCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tarefa atualizada com sucesso!"})
}

func DeleteNotes(c *gin.Context) {

}
