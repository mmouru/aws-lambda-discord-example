package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ssm"
	"github.com/bwmarrin/discordgo"
)

var channelId string = "discord_channel_id"

type MyEvent struct {
	Name   string `json:"name"`
	UserId string `json:"userId"`
}

func HandleRequest(ctx context.Context, event *MyEvent) (*string, error) {
	if event == nil {
		return nil, fmt.Errorf("received nil event")
	}

	ssmClient := ssm.New(session.New())
	parameterName := "/cakealert/discord/token"

	discordToken, err := ssmClient.GetParameter(&ssm.GetParameterInput{
		Name:           &parameterName,
		WithDecryption: aws.Bool(true),
	})

	if err != nil {
		return nil, err
	}

	discord, err := discordgo.New("Bot " + discordToken)
	if err != nil {
		fmt.Println("error creating Discord session,", err)
		return nil, err
	}
	err = discord.Open()
	discord.ChannelMessageSend(channelId, fmt.Sprintf("<@%s> Happy Birthday %s!", event.UserId, event.Name))

	mes := "Congratulations sent to discord!"
	return &mes, nil
}

func main() {
	lambda.Start(HandleRequest)
}
