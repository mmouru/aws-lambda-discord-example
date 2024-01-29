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

var channelId string = "< your channel id here >"

type MyEvent struct {
	Message string `json:"message"`
}

func HandleRequest(ctx context.Context, event *MyEvent) (*string, error) {
	if event == nil {
		return nil, fmt.Errorf("received nil event")
	}

	ssmClient := ssm.New(session.New())
	parameterName := "/cakealert/discord/token"

	discordTokenOutput, err := ssmClient.GetParameter(&ssm.GetParameterInput{
		Name:           &parameterName,
		WithDecryption: aws.Bool(true),
	})

	if err != nil {
		return nil, err
	}

	discordToken := discordTokenOutput.Parameter.Value

	discord, err := discordgo.New("Bot " + *discordToken)
	if err != nil {
		fmt.Println("error creating Discord session,", err)
		return nil, err
	}
	err = discord.Open()
	discord.ChannelMessageSend(channelId, event.Message)

	mes := "Congratulations sent to discord!"
	return &mes, nil
}

func main() {
	lambda.Start(HandleRequest)
}
