
import {
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_events as events
} from 'aws-cdk-lib';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import * as path from "path";

export class CakeAlertStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    const fn = new lambda.Function(this, 'MyLambda', {
      runtime: lambda.Runtime.GO_1_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './lambda')),
      handler: 'lambda', // Assumes your Golang code has a main function
    });

    const myLambdaAsIFunction: lambda.IFunction = fn;

    // set birthday dates
    const cakeDates = [
      { month: 4, day: 27 }, 
      // Add more dates as needed
    ];

    // set a new rule for each bday
    cakeDates.forEach((date, index) => {
      const scheduleRule = new events.Rule(this, `ScheduledRule${index + 1}`, {
        schedule: events.Schedule.expression(`cron(0 ${date.day} ${date.month} ? *)`), // each year
        targets: [
          new LambdaFunction(fn, {
            event: events.RuleTargetInput.fromObject({
              message: `Good Bday from ${index + 1} on ${date.day}.${date.month}!`,
            }),
          }),
        ],
      }
    })
    new events.Rule(this, 'ScheduleRule', {
      
      schedule:  events.Schedule.expression('cron(* * * * ? *)'), // set appropriate cron, once a year 
      targets: [new LambdaFunction(myLambdaAsIFunction, {
        event: events.RuleTargetInput.fromObject({
          message: 'Good Birthday Boy',
        }),
      })],
     });
  }
}
