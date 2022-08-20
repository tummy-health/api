import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import Logger from '@src/logging/logger';
import ILogger from '@src/logging/loggerType';
import IStorageEngine, {
  AddItemInput,
  CreateTableInput,
  GetItemsInput,
  Item,
} from '@src/storage/engineType';
import ExistingTableError from '@src/storage/existingTableError';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingTableError from '@src/storage/missingTableError';
import wait from '@src/utils/wait';

class StorageEngine implements IStorageEngine {
  readonly client: DynamoDBClient;

  readonly documentClient: DynamoDBDocumentClient;

  readonly logger: ILogger;

  constructor({
    id,
    logger = new Logger(),
    region = 'us-east-2',
    secret,
  }: {
    id: string;
    logger?: ILogger;
    region?: string;
    secret: string;
  }) {
    this.client = new DynamoDBClient({
      credentials: {
        accessKeyId: id,
        secretAccessKey: secret,
      },
      region,
    });
    this.documentClient = DynamoDBDocumentClient.from(this.client);
    this.logger = logger;
  }

  addItem = async ({ item, tableName }: AddItemInput) => {
    const command = new PutCommand({
      Item: item,
      TableName: tableName,
    });
    try {
      await this.client.send(command);
    } catch (error) {
      if (error.name === 'ResourceNotFoundException')
        throw new MissingTableError({ tableName });
      if (
        error.name === 'ValidationException' &&
        error.message.includes('Missing the key')
      ) {
        throw new MissingKeyError();
      }
      throw error;
    }
    return item;
  };

  createTable = async ({ hashKey, sortKey, tableName }: CreateTableInput) => {
    const attributes = [{ AttributeName: hashKey, AttributeType: 'S' }];
    const keys = [{ AttributeName: hashKey, KeyType: 'HASH' }];
    if (sortKey) {
      attributes.push({ AttributeName: sortKey, AttributeType: 'S' });
      keys.push({ AttributeName: sortKey, KeyType: 'RANGE' });
    }
    const createTableCommand = new CreateTableCommand({
      AttributeDefinitions: attributes,
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: keys,
      TableName: tableName,
    });
    try {
      await this.client.send(createTableCommand);
    } catch (error) {
      if (error.name === 'ResourceInUseException')
        throw new ExistingTableError({ tableName });
      throw error;
    }
    await this.waitForTable({ tableName });
  };

  private describeTable = async ({
    tableName,
  }: {
    tableName: string;
  }): Promise<{ hashKey: string; sortKey?: string; status: string }> => {
    const command = new DescribeTableCommand({
      TableName: tableName,
    });
    try {
      const {
        Table: { KeySchema: keys, TableStatus: status },
      } = await this.client.send(command);
      const { AttributeName: hashKey } = keys.find(
        ({ KeyType }) => KeyType === 'HASH'
      );
      const { AttributeName: sortKey } =
        keys.find(({ KeyType }) => KeyType === 'RANGE') || {};
      return { hashKey, sortKey, status };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException')
        throw new MissingTableError({ tableName });
      throw error;
    }
  };

  getItems = async ({
    hashKeyName,
    hashKeyValue,
    tableName,
  }: GetItemsInput): Promise<Item[]> => {
    const expression = `${hashKeyName} = :hashKeyValue`;
    const command = new QueryCommand({
      ExpressionAttributeValues: {
        ':hashKeyValue': hashKeyValue,
      },
      KeyConditionExpression: expression,
      TableName: tableName,
    });
    try {
      const response = await this.documentClient.send(command);
      const { Items: items } = response;
      return items;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException')
        throw new MissingTableError({ tableName });
      throw error;
    }
  };

  private waitForTable = async ({ tableName }: { tableName: string }) => {
    let hasFinishedCreating = false;
    do {
      const { status } = await this.describeTable({ tableName }); // eslint-disable-line no-await-in-loop
      hasFinishedCreating = status !== 'CREATING';
      await wait({ seconds: 0.1 }); // eslint-disable-line no-await-in-loop
    } while (!hasFinishedCreating);
  };
}

export default StorageEngine;
