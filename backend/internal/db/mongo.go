package db

import (
	"context"
	"errors"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var (
	mongoClient *mongo.Client
	mongoOnce   sync.Once
	mongoInit   error
)

func InitMongo(ctx context.Context, uri string) error {
	mongoOnce.Do(func() {
		clientOptions := options.Client().
			ApplyURI(uri).
			SetMaxPoolSize(50).
			SetMinPoolSize(10).
			SetConnectTimeout(10 * time.Second).
			SetServerSelectionTimeout(5 * time.Second)

		client, err := mongo.Connect(ctx, clientOptions)
		if err != nil {
			mongoInit = err
			return
		}

		if err := client.Ping(ctx, readpref.Primary()); err != nil {
			mongoInit = err
			return
		}

		mongoClient = client
		mongoInit = nil
	})

	return mongoInit
}

func GetMongoClient() *mongo.Client {
	return mongoClient
}

func PingMongo(ctx context.Context) error {
	if mongoClient == nil {
		return errors.New("mongo client is not initialized")
	}
	return mongoClient.Ping(ctx, readpref.Primary())
}

func GetCollection(ctx context.Context, dbName, collName string) (*mongo.Collection, error) {
	if mongoClient == nil {
		return nil, errors.New("mongo client is not initialized")
	}
	return mongoClient.Database(dbName).Collection(collName), nil
}

func ListDatabases(ctx context.Context) ([]string, error) {
	if mongoClient == nil {
		return nil, errors.New("mongo client is not initialized")
	}
	return mongoClient.ListDatabaseNames(ctx, bson.M{})
}

func CloseMongo(ctx context.Context) error {
	if mongoClient == nil {
		return nil
	}
	return mongoClient.Disconnect(ctx)
}
