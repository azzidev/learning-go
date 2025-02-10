package handlers

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type User struct {
	Name  string `json:"name" bson:"name"`
	Email string `json:"email" bson:"email"`
}

var collection *mongo.Collection

func Init(client *mongo.Client) {
	collection = client.Database("testdb").Collection("users")
}

func CreateUser(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := collection.InsertOne(context.Background(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário criado com sucesso!"})
}

func GetUsers(c *gin.Context) {
	var users []User
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var user User
		cursor.Decode(&user)
		users = append(users, user)
	}

	c.JSON(http.StatusOK, users)
}

func UpdateUser(c *gin.Context) {
	email := c.Param("email") // Obtém o email do usuário a ser atualizado
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filter := bson.M{"email": email}
	update := bson.M{"$set": bson.M{"name": user.Name, "email": user.Email}}

	_, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário atualizado com sucesso!"})
}

func DeleteUser(c *gin.Context) {
	email := c.Param("email") // Obtém o email do usuário a ser excluído

	filter := bson.M{"email": email}
	_, err := collection.DeleteOne(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário excluído com sucesso!"})
}
