import {
  AttributeValue,
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  GetItemCommand,
  ListTablesCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';

export const addItem = async ({
  item,
  tableName,
}: {
  item: Record<string, AttributeValue>;
  tableName: string;
}) => {
  const client = new DynamoDBClient({});
  const putItemCommand = new PutItemCommand({
    Item: item,
    TableName: tableName,
  });
  await client.send(putItemCommand);
};

export const createTable = async ({
  hashKey,
  sortKey,
  tableName,
}: {
  hashKey: string;
  sortKey?: string;
  tableName: string;
}) => {
  const client = new DynamoDBClient({});
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
  await client.send(createTableCommand);
  let hasFinishedCreating = false;
  do {
    const {
      Table: { TableStatus: status },
    } = await describeTable({ tableName }); // eslint-disable-line no-await-in-loop
    hasFinishedCreating = status !== 'CREATING';
  } while (!hasFinishedCreating);
};

export const deleteTable = async ({ tableName }) => {
  const client = new DynamoDBClient({});
  const command = new DeleteTableCommand({
    TableName: tableName,
  });
  return client.send(command);
};

export const describeTable = async ({ tableName }) => {
  const client = new DynamoDBClient({});
  const command = new DescribeTableCommand({
    TableName: tableName,
  });
  return client.send(command);
};

export const getItem = async ({
  hashKeyName,
  hashKeyValue,
  sortKeyName,
  sortKeyValue,
  tableName,
}: {
  hashKeyName: string;
  hashKeyValue: string;
  sortKeyName?: string;
  sortKeyValue?: string;
  tableName: string;
}) => {
  const client = new DynamoDBClient({});
  const key = {
    [hashKeyName]: { S: hashKeyValue },
  };
  if (sortKeyName && sortKeyValue) key[sortKeyName] = { S: sortKeyValue };
  const command = new GetItemCommand({
    Key: key,
    TableName: tableName,
  });
  return client.send(command);
};

export const listTables = async ({ prefix }) => {
  const client = new DynamoDBClient({});
  const command = new ListTablesCommand({
    ExclusiveStartTableName: prefix,
  });
  const response = await client.send(command);
  response.TableNames = response.TableNames.filter((name) =>
    name.startsWith(prefix)
  );
  return response;
};

export default {};
