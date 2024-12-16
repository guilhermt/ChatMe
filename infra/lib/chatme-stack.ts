import * as cdk from 'aws-cdk-lib';
import { type Construct } from 'constructs';
import { Cognito } from './constructs/cognito';
import { WebApp } from './constructs/web-app';
import { Database } from './constructs/dynamo';
import { RestAPI } from './constructs/rest-api';
import { Storage } from './constructs/s3';
import { WebSocketAPI } from './constructs/ws-api';

export class ChatMeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { userPool, userPoolClientId } = new Cognito(this, 'Cognito');

    const { dynamoTable } = new Database(this, 'Database');

    const { bucket } = new Storage(this, 'Storage');

    const { wsAPI } = new WebSocketAPI(this, 'WebSocketApi', {
      dynamoTable,
      userPoolClientId,
      userPool,
      bucket
    });

    const { restApiUrl } = new RestAPI(this, 'RestApi', {
      dynamoTable,
      userPoolClientId,
      userPool,
      bucket,
      wsAPI
    });

    const { webAppUrl } = new WebApp(this, 'WebApp');

    new cdk.CfnOutput(this, 'WebAppUrl', {
      value: webAppUrl
    });

    new cdk.CfnOutput(this, 'RestApiUrl', {
      value: restApiUrl
    });

    new cdk.CfnOutput(this, 'WebSocketApiUrl', {
      value: wsAPI.apiEndpoint
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClientId
    });
  }
}
