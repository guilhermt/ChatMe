import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  AccountRecovery,
  StringAttribute,
  UserPool
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { getEnvName } from '../utils/getEnvName';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { join } from 'path';

export class Cognito extends Construct {
  readonly userPool: UserPool;
  readonly userPoolClientId: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const customEmailLambda = new NodejsFunction(
      this,
      'ChatMeCustomEmailLambda',
      {
        entry: join(
          __dirname,
          '../../src/restApi/handlers/authentication/customEmail.ts'
        ),
        handler: 'handler',
        functionName: getEnvName('ChatMeCustomEmailLambda'),
        runtime: Runtime.NODEJS_20_X,
        logRetention: RetentionDays.TWO_WEEKS
      }
    );

    this.userPool = new UserPool(scope, 'Userpool', {
      userPoolName: getEnvName('ChatMeUserpool'),
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      },
      passwordPolicy: {
        requireDigits: false,
        requireUppercase: false,
        requireLowercase: false,
        requireSymbols: false,
        minLength: 6
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
      customAttributes: {
        organizationId: new StringAttribute()
      },
      lambdaTriggers: {
        customMessage: customEmailLambda
      }
    });

    const client = this.userPool.addClient('UserPoolClient', {
      userPoolClientName: getEnvName('ChatMeUserPoolClient'),
      authFlows: {
        userSrp: true
      },
      idTokenValidity: Duration.days(1),
      accessTokenValidity: Duration.days(1),
      refreshTokenValidity: Duration.days(1)
    });

    this.userPoolClientId = client.userPoolClientId;
  }
}
