import { CorsHttpMethod, HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { type Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpMethod } from 'aws-cdk-lib/aws-events';
import path from 'path';
import { type UserPool } from 'aws-cdk-lib/aws-cognito';
import { type Bucket } from 'aws-cdk-lib/aws-s3';
import { getEnvName } from '../utils/getEnvName';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

interface RestAPIProps {
  dynamoTable: Table;
  userPoolClientId: string;
  userPool: UserPool;
  bucket: Bucket;
}

interface RouteProps {
  lambdaName: string;
  lambdaEntry: string;
  routePath: string;
  routeMethod: HttpMethod;
  bucketPermission?: boolean;
  cognitoPermission?: boolean;
}

export class RestAPI extends Construct {
  readonly restApiUrl: string;

  constructor(scope: Construct, id: string, props: RestAPIProps) {
    super(scope, id);

    const { dynamoTable, userPoolClientId, userPool, bucket } = props;

    const httpApi = new HttpApi(this, 'ApiGateway', {
      apiName: getEnvName('ChatMe REST API'),
      corsPreflight: {
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: ['*'],
        allowHeaders: ['Authorization', 'Content-Type']
      }
    });

    const environment = {
      ENVIRONMENT: process.env.ENVIRONMENT ?? '',
      TABLE_NAME: dynamoTable.tableName,
      BUCKET_NAME: bucket.bucketName,
      USERPOOL_CLIENT_ID: userPoolClientId,
      USERPOOL_ID: userPool.userPoolId,
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ?? ''
    };

    const handlersPath = path.join(__dirname, '../../src/restApi/handlers');

    const routes: RouteProps[] = [
      {
        lambdaName: 'SignUp',
        lambdaEntry: 'authentication/signUp.ts',
        routePath: '/sign-up',
        routeMethod: HttpMethod.POST,
        cognitoPermission: true
      },
      {
        lambdaName: 'GetUser',
        lambdaEntry: 'users/getUser.ts',
        routePath: '/users/me',
        routeMethod: HttpMethod.GET
      },
      {
        lambdaName: 'ListUsers',
        lambdaEntry: 'users/listUsers.ts',
        routePath: '/users',
        routeMethod: HttpMethod.GET
      },
      {
        lambdaName: 'ListChats',
        lambdaEntry: 'chats/listChats.ts',
        routePath: '/chats',
        routeMethod: HttpMethod.GET
      },
      {
        lambdaName: 'StartChat',
        lambdaEntry: 'chats/startChat.ts',
        routePath: '/chats',
        routeMethod: HttpMethod.POST
      },
      {
        lambdaName: 'ListMessages',
        lambdaEntry: 'messages/listMessages.ts',
        routePath: '/messages/{chatId}',
        routeMethod: HttpMethod.GET
      }
    ];

    const createRoute = (props: RouteProps) => {
      const {
        lambdaEntry,
        lambdaName,
        routeMethod,
        routePath,
        bucketPermission,
        cognitoPermission
      } = props;

      const entry = path.join(handlersPath, lambdaEntry);

      const lambdaId = `ChatMe-${lambdaName}Lambda`;

      const integrationId = `ChatMe-${lambdaName}Integration`;

      const functionName = getEnvName(lambdaId);

      const lambda = new NodejsFunction(this, lambdaId, {
        entry,
        handler: 'handler',
        functionName,
        runtime: Runtime.NODEJS_20_X,
        logRetention: RetentionDays.TWO_WEEKS,
        environment,
        memorySize: 2048,
        bundling: {
          minify: true
        }
      });

      dynamoTable.grantReadWriteData(lambda);

      if (bucketPermission) bucket.grantReadWrite(lambda);

      if (cognitoPermission) {
        userPool.grant(
          lambda,
          'cognito-idp:AdminCreateUser',
          'cognito-idp:AdminSetUserPassword'
        );
      }

      const integration = new HttpLambdaIntegration(integrationId, lambda);

      httpApi.addRoutes({
        path: routePath,
        methods: [routeMethod],
        integration
      });
    };

    routes.forEach(createRoute);

    this.restApiUrl = httpApi.url!;
  }
}
