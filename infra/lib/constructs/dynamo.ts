import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getEnvName } from '../utils/getEnvName';

export class Database extends Construct {
  readonly dynamoTable: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.dynamoTable = new Table(scope, 'Table', {
      tableName: getEnvName('chatme-table', true),
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      }
    });

    this.dynamoTable.addGlobalSecondaryIndex({
      indexName: 'secondaryIndex',
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'gsi', type: AttributeType.NUMBER }
    });
  }
}
