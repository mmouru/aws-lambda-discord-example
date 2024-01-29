
import {
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_events as events,
  aws_iam as iam
} from 'aws-cdk-lib';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import * as path from "path";
import { cakeDates } from './cake-dates';

export class CakeAlertStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    const fn = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.GO_1_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: 'lambda', // Assumes your Golang code has a main function
    });

    const dicordParameterToken = "/cakealert/discord/token"

    const ssmPolicy = new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:${process.env.REGION}:${process.env.ACCOUNT}:parameter${dicordParameterToken}`],
    });

    fn.addToRolePolicy(ssmPolicy);

    // set a new rule for each bday
    cakeDates.forEach((date, index) => {
      const scheduleRule = new events.Rule(this, `ScheduledRule${index + 1}`, {
        schedule: events.Schedule.expression('cron(*/1 * * * ? *)'), // each year     cron(0 ${date.day} ${date.month} ? *)
        targets: [
          new LambdaFunction(fn, {
            event: events.RuleTargetInput.fromObject({
              message: `Good Bday from ${index + 1} on ${date.day}.${date.month}! <@${date.discordId}>`,
            }),
          }),
        ],
      })
    });
  }
}
