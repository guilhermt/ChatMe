import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import {
  RemovalPolicy,
  aws_cloudfront,
  aws_cloudfront_origins
} from 'aws-cdk-lib';
import {
  type DistributionProps,
  OriginAccessIdentity
} from 'aws-cdk-lib/aws-cloudfront';
import path from 'path';
import { getEnvName } from '../utils/getEnvName';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { configEnv } from '../config';

export class WebApp extends Construct {
  readonly webAppUrl: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const appPath = path.join(__dirname, '../../../web/dist');

    const webBucket = new s3.Bucket(this, 'WebAppBucket', {
      bucketName: getEnvName('chatme-web-bucket', true),
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      autoDeleteObjects: true
    });

    const originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity'
    );

    const certificate = Certificate.fromCertificateArn(this, 'Certificate', configEnv.certificateArn);

    const cloudFrontConfig: DistributionProps = {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new aws_cloudfront_origins.S3Origin(webBucket, {
          originAccessIdentity
        }),
        viewerProtocolPolicy:
          aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: aws_cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ],
      domainNames: [configEnv.domainNames.webApp],
      certificate
    };

    webBucket.grantRead(originAccessIdentity);

    const cfDistribution = new aws_cloudfront.Distribution(
      this,
      'CFDistribution',
      cloudFrontConfig
    );

    new BucketDeployment(this, 'S3Deployment', {
      sources: [Source.asset(appPath)],
      destinationBucket: webBucket,
      distribution: cfDistribution
    });

    this.webAppUrl = cfDistribution.distributionDomainName;
  }
}
