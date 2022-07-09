import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

import IStorageEngine, {
  AddItemInput,
  CreateTableInput,
} from '@src/storage/engineType';
import ExistingTableError from '@src/storage/existingTableError';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingTableError from '@src/storage/missingTableError';

class StorageEngine implements IStorageEngine {
  client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});
  }

  addItem = async ({ item, tableName }: AddItemInput) => {
    const formattedItem = Object.entries(item).reduce(
      (result, [propertyName, propertyValue]) => ({
        ...result,
        [propertyName]: { S: propertyValue.toString() },
      }),
      {}
    );
    const putItemCommand = new PutItemCommand({
      Item: formattedItem,
      TableName: tableName,
    });
    try {
      await this.client.send(putItemCommand);
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
    let hasFinishedCreating = false;
    do {
      const { status } = await this.describeTable({ tableName }); // eslint-disable-line no-await-in-loop
      hasFinishedCreating = status !== 'CREATING';
    } while (!hasFinishedCreating);
  };

  describeTable = async ({ tableName }) => {
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
}

export default StorageEngine;
