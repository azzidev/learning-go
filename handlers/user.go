package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Name     string `json:"name" bson:"name"`
	Email    string `json:"email" bson:"email"`
	PassHash string `json:"passHash" bson:"passHash"`
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

	// Gera o hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PassHash), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	_, err = collection.InsertOne(context.Background(), bson.M{
		"name":     user.Name,
		"email":    user.Email,
		"passHash": string(hashedPassword),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário criado com sucesso!"})
}

func LoginUser(c *gin.Context) {
	var credentials struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Busca o usuário no banco de dados
	var user User
	err := collection.FindOne(context.Background(), bson.M{"email": credentials.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Compara a senha fornecida com o hash armazenado
	err = bcrypt.CompareHashAndPassword([]byte(user.PassHash), []byte(credentials.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Gera o token JWT
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &jwt.StandardClaims{
		Subject:   user.Email,
		ExpiresAt: expirationTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte("sua_chave_secreta"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Retorna o token JWT
	c.JSON(http.StatusOK, gin.H{"token": tokenString})
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
