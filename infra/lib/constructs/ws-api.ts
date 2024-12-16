import { DomainName, WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { type Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import path from 'path';
import { type UserPool } from 'aws-cdk-lib/aws-cognito';
import { type Bucket } from 'aws-cdk-lib/aws-s3';
import { getEnvName } from '../utils/getEnvName';
import { NodejsFunction, type NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { configEnv } from '../config';

interface WebSocketAPIProps {
  dynamoTable: Table;
  userPoolClientId: string;
  userPool: UserPool;
  bucket: Bucket;
}

export class WebSocketAPI extends Construct {
  readonly wsAPI: WebSocketApi;

  constructor(scope: Construct, id: string, props: WebSocketAPIProps) {
    super(scope, id);

    const { dynamoTable, userPoolClientId, userPool, bucket } = props;

    const queue = new Queue(this, 'ChatMeQueue', {
      queueName: getEnvName('ChatMe-Queue'),
      retentionPeriod: Duration.minutes(1)
    });

    const environment = {
      ENVIRONMENT: configEnv.env,
      TABLE_NAME: dynamoTable.tableName,
      BUCKET_NAME: bucket.bucketName,
      USERPOOL_CLIENT_ID: userPoolClientId,
      USERPOOL_ID: userPool.userPoolId,
      QUEUE_URL: queue.queueUrl
    };

    const handlersPath = path.join(__dirname, '../../src/wsApi/handlers');

    const baseLambdaProps: NodejsFunctionProps = {
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
      logRetention: RetentionDays.TWO_WEEKS,
      environment,
      memorySize: 2048,
      bundling: {
        minify: true
      }
    };

    const connectHandler = new NodejsFunction(this, 'ChatMe-Connect-WSLambda', {
      entry: path.join(handlersPath, 'connect.ts'),
      functionName: getEnvName('ChatMe-Connect-WSLambda'),
      ...baseLambdaProps
    });

    const disconnectHandler = new NodejsFunction(this, 'ChatMe-Disconnect-WSLambda', {
      entry: path.join(handlersPath, 'disconnect.ts'),
      functionName: getEnvName('ChatMe-Disconnect-WSLambda'),
      ...baseLambdaProps
    });

    const sqsHandler = new NodejsFunction(this, 'ChatMe-SendOnlineUsers', {
      functionName: getEnvName('ChatMe-SendOnlineUsers'),
      entry: path.join(handlersPath, 'queue.ts'),
      ...baseLambdaProps
    });

    const sendMessageHandler = new NodejsFunction(this, 'ChatMe-SendMessage', {
      functionName: getEnvName('ChatMe-SendMessage'),
      entry: path.join(handlersPath, 'sendMessage.ts'),
      ...baseLambdaProps
    });

    const viewChatHandler = new NodejsFunction(this, 'ChatMe-ViewChat', {
      functionName: getEnvName('ChatMe-ViewChat'),
      entry: path.join(handlersPath, 'viewChat.ts'),
      ...baseLambdaProps
    });

    const typingChatHandler = new NodejsFunction(this, 'ChatMe-TypingChat', {
      functionName: getEnvName('ChatMe-TypingChat'),
      entry: path.join(handlersPath, 'typingChat.ts'),
      ...baseLambdaProps
    });

    const webSocketApi = new WebSocketApi(this, 'WebSocketApi', {
      apiName: getEnvName('ChatMe WebSocket API'),
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectRoute', connectHandler)
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration('ConnectRoute', disconnectHandler)
      }
    });

    webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageRoute', sendMessageHandler)
    });

    webSocketApi.addRoute('viewChat', {
      integration: new WebSocketLambdaIntegration('ViewChatRoute', viewChatHandler)
    });

    webSocketApi.addRoute('typingChat', {
      integration: new WebSocketLambdaIntegration('TypingChatRoute', typingChatHandler)
    });

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', configEnv.certificateArn);

    new WebSocketStage(this, 'WebSocketApiStage', {
      webSocketApi,
      stageName: configEnv.env,
      autoDeploy: true,
      domainMapping: {
        domainName: new DomainName(this, 'ApiDomainName', {
          domainName: configEnv.domainNames.wsApi,
          certificate
        })
      }
    });

    sqsHandler.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
        maxConcurrency: 2
      })
    );

    queue.grantSendMessages(connectHandler);
    queue.grantSendMessages(disconnectHandler);

    queue.grantConsumeMessages(sqsHandler);

    dynamoTable.grantReadWriteData(connectHandler);
    dynamoTable.grantReadWriteData(disconnectHandler);
    dynamoTable.grantReadWriteData(sqsHandler);
    dynamoTable.grantReadWriteData(sendMessageHandler);
    dynamoTable.grantReadWriteData(viewChatHandler);
    dynamoTable.grantReadWriteData(typingChatHandler);

    webSocketApi.grantManageConnections(connectHandler);
    webSocketApi.grantManageConnections(disconnectHandler);
    webSocketApi.grantManageConnections(sqsHandler);
    webSocketApi.grantManageConnections(sendMessageHandler);
    webSocketApi.grantManageConnections(typingChatHandler);

    this.wsAPI = webSocketApi;
  }
}
