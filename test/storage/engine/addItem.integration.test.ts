import { v4 as uuid } from 'uuid';

import StorageEngine from '@src/storage/engine';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingTableError from '@src/storage/missingTableError';
import {
  addItem,
  createTable,
  deleteTable,
  getItem,
  listTables,
} from '@test/storage/engine/utils';

const ENVIRONMENT = 'integrationTest-addItem';

jest.setTimeout(10000);

afterAll(async () => {
  const { TableNames: tableNames } = await listTables({ prefix: ENVIRONMENT });
  const promises = tableNames.map((tableName) => deleteTable({ tableName }));
  await Promise.all(promises);
});

test('adds item', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName,
  });
  const engine = new StorageEngine();
  const item = {
    booleanProperty: true,
    numericProperty: 9,
    stringProperty: 'test-value',
    testHashKey: 'test-hash-key',
    testSortKey: 'test-sort-key',
  };
  const returnedItem = await engine.addItem({
    item,
    tableName,
  });
  const response = await getItem({
    hashKeyName: 'testHashKey',
    hashKeyValue: 'test-hash-key',
    sortKeyName: 'testSortKey',
    sortKeyValue: 'test-sort-key',
    tableName,
  });
  const { Item: savedItem } = response;
  expect(returnedItem).toMatchObject(item);
  expect(savedItem).toMatchObject(item);
});

test('adds item without sort key', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    tableName,
  });
  const item = {
    otherProperty: 'test-value',
    testHashKey: 'test-hash-key',
  };
  const engine = new StorageEngine();
  const returnedItem = await engine.addItem({
    item,
    tableName,
  });
  const response = await getItem({
    hashKeyName: 'testHashKey',
    hashKeyValue: 'test-hash-key',
    tableName,
  });
  const { Item: savedItem } = response;
  expect(returnedItem).toMatchObject(item);
  expect(savedItem).toMatchObject(item);
});

test('throws error if table does not exist', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  const engine = new StorageEngine();
  await expect(
    engine.addItem({
      item: {
        otherProperty: 'test-value',
        testHashKey: 'test-hash-key',
      },
      tableName,
    })
  ).rejects.toThrow(MissingTableError);
});

test('throws error if item is missing hash key', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    tableName,
  });
  const engine = new StorageEngine();
  await expect(
    engine.addItem({
      item: {
        otherProperty: 'test-value',
      },
      tableName,
    })
  ).rejects.toThrow(MissingKeyError);
});

test('throws error if item is missing sort key', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName,
  });
  const engine = new StorageEngine();
  await expect(
    engine.addItem({
      item: {
        testHashKey: 'test-hash-key',
        otherProperty: 'test-value',
      },
      tableName,
    })
  ).rejects.toThrow(MissingKeyError);
});

test('overwrites item with matching key', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    tableName,
  });
  await addItem({
    item: {
      testHashKey: 'test-hash-key',
      otherProperty: 'test-value',
    },
    tableName,
  });
  const engine = new StorageEngine();
  await engine.addItem({
    item: {
      testHashKey: 'test-hash-key',
      otherProperty: 'test-other-value',
    },
    tableName,
  });
  const { Item: item } = await getItem({
    hashKeyName: 'testHashKey',
    hashKeyValue: 'test-hash-key',
    tableName,
  });
  expect(item).toMatchObject({
    testHashKey: 'test-hash-key',
    otherProperty: 'test-other-value',
  });
});
