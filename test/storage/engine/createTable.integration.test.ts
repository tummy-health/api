import { v4 as uuid } from 'uuid';

import StorageEngine from '@src/storage/engine';
import ExistingTableError from '@src/storage/existingTableError';
import {
  createTable,
  deleteTable,
  describeTable,
  listTables,
} from '@test/storage/utils';

const ENVIRONMENT = 'integrationTest-createTable';

jest.setTimeout(10000);

afterAll(async () => {
  const { TableNames: tableNames } = await listTables({ prefix: ENVIRONMENT });
  const promises = tableNames.map((tableName) => deleteTable({ tableName }));
  await Promise.all(promises);
});

test('creates table', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  const engine = new StorageEngine();
  await engine.createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName,
  });
  const table = await describeTable({ tableName });
  expect(table).toMatchObject({
    Table: {
      AttributeDefinitions: [
        { AttributeName: 'testHashKey', AttributeType: 'S' },
        { AttributeName: 'testSortKey', AttributeType: 'S' },
      ],
      BillingModeSummary: { BillingMode: 'PAY_PER_REQUEST' },
      KeySchema: [
        { AttributeName: 'testHashKey', KeyType: 'HASH' },
        { AttributeName: 'testSortKey', KeyType: 'RANGE' },
      ],
    },
  });
});

test('creates table without sort key', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  const engine = new StorageEngine();
  await engine.createTable({
    hashKey: 'testHashKey',
    tableName,
  });
  const table = await describeTable({ tableName });
  expect(table).toMatchObject({
    Table: {
      AttributeDefinitions: [
        { AttributeName: 'testHashKey', AttributeType: 'S' },
      ],
      BillingModeSummary: { BillingMode: 'PAY_PER_REQUEST' },
      KeySchema: [{ AttributeName: 'testHashKey', KeyType: 'HASH' }],
    },
  });
});

test('throws error if table exists', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName,
  });
  const engine = new StorageEngine();
  await expect(async () => {
    await engine.createTable({
      hashKey: 'differentHashKey',
      sortKey: 'differentSortKey',
      tableName,
    });
  }).rejects.toThrow(ExistingTableError);
});
