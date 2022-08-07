import TestLogger from '@src/logging/testLogger';
import StorageClient from '@src/storage/client';
import MissingKeyError from '@src/storage/missingKeyError';
import TestStorageEngine from '@src/storage/testEngine';

test('creates table and adds item', async () => {
  const engine = new TestStorageEngine();
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  const returnedItem = await client.addItem({
    item: {
      testHashKey: 'test-hash-key',
      testSortKey: 'test-sort-key',
    },
    table: {
      hashKeys: ['testHashKey'],
      name: 'test-table',
      sortKeys: ['testSortKey'],
    },
  });
  expect(engine.tables['test-addItem-test-table']).toMatchObject({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
  });
  const expectedItem = {
    id: 'test-id',
    createdDate: '2020-01-01T00:00:00',
    testHashKey: 'test-hash-key',
    testSortKey: 'test-sort-key',
  };
  expect(returnedItem).toMatchObject(expectedItem);
  expect(
    engine.items['test-addItem-test-table']['test-hash-key+test-sort-key']
  ).toMatchObject(expectedItem);
});

test('creates table and adds item without sort key', async () => {
  const engine = new TestStorageEngine();
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  const returnedItem = await client.addItem({
    item: {
      testHashKey: 'test-hash-key',
    },
    table: {
      hashKeys: ['testHashKey'],
      name: 'test-table',
    },
  });
  expect(engine.tables['test-addItem-test-table']).toMatchObject({
    hashKey: 'testHashKey',
  });
  const expectedItem = {
    id: 'test-id',
    createdDate: '2020-01-01T00:00:00',
    testHashKey: 'test-hash-key',
  };
  expect(returnedItem).toMatchObject(expectedItem);
  expect(
    engine.items['test-addItem-test-table']['test-hash-key']
  ).toMatchObject(expectedItem);
});

test('adds item to existing table', async () => {
  const engine = new TestStorageEngine({
    tables: { 'test-addItem-test-table': { hashKey: 'testHashKey' } },
  });
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  const returnedItem = await client.addItem({
    item: {
      testHashKey: 'test-hash-key',
    },
    table: {
      hashKeys: ['testHashKey'],
      name: 'test-table',
    },
  });
  const expectedItem = {
    id: 'test-id',
    createdDate: '2020-01-01T00:00:00',
    testHashKey: 'test-hash-key',
  };
  expect(returnedItem).toMatchObject(expectedItem);
  expect(
    engine.items['test-addItem-test-table']['test-hash-key']
  ).toMatchObject(expectedItem);
});

test('creates table and adds item with composite hash key', async () => {
  const engine = new TestStorageEngine();
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  const returnedItem = await client.addItem({
    item: {
      firstHashKeyComponent: 'first-hash-key-component',
      secondHashKeyComponent: 'second-hash-key-component',
    },
    table: {
      hashKeys: ['firstHashKeyComponent', 'secondHashKeyComponent'],
      name: 'test-table',
    },
  });
  expect(engine.tables['test-addItem-test-table']).toMatchObject({
    hashKey: 'firstHashKeyComponent|secondHashKeyComponent',
  });
  const expectedItem = {
    id: 'test-id',
    createdDate: '2020-01-01T00:00:00',
    firstHashKeyComponent: 'first-hash-key-component',
    secondHashKeyComponent: 'second-hash-key-component',
    'firstHashKeyComponent|secondHashKeyComponent':
      'first-hash-key-component|second-hash-key-component',
  };
  expect(returnedItem).toMatchObject(expectedItem);
  expect(
    engine.items['test-addItem-test-table'][
      'first-hash-key-component|second-hash-key-component'
    ]
  ).toMatchObject(expectedItem);
});

test('creates table and adds item with composite sort key', async () => {
  const engine = new TestStorageEngine();
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  const returnedItem = await client.addItem({
    item: {
      testHashKey: 'test-hash-key',
      firstSortKeyComponent: 'first-sort-key-component',
      secondSortKeyComponent: 'second-sort-key-component',
    },
    table: {
      hashKeys: ['testHashKey'],
      sortKeys: ['firstSortKeyComponent', 'secondSortKeyComponent'],
      name: 'test-table',
    },
  });
  expect(engine.tables['test-addItem-test-table']).toMatchObject({
    hashKey: 'testHashKey',
    sortKey: 'firstSortKeyComponent|secondSortKeyComponent',
  });
  const expectedItem = {
    id: 'test-id',
    createdDate: '2020-01-01T00:00:00',
    testHashKey: 'test-hash-key',
    firstSortKeyComponent: 'first-sort-key-component',
    secondSortKeyComponent: 'second-sort-key-component',
    'firstSortKeyComponent|secondSortKeyComponent':
      'first-sort-key-component|second-sort-key-component',
  };
  expect(returnedItem).toMatchObject(expectedItem);
  expect(
    engine.items['test-addItem-test-table'][
      'test-hash-key+first-sort-key-component|second-sort-key-component'
    ]
  ).toMatchObject(expectedItem);
});

test('throws error if item is missing component of composite hash key', async () => {
  const engine = new TestStorageEngine();
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  await expect(
    client.addItem({
      item: {
        firstHashKeyComponent: 'first-hash-key-component',
        testSortKey: 'test-sort-key',
      },
      table: {
        hashKeys: ['firstHashKeyComponent', 'secondHashKeyComponent'],
        sortKeys: ['testSortKey'],
        name: 'test-table',
      },
    })
  ).rejects.toThrow(MissingKeyError);
});

test('throws error if item is missing component of composite hash key', async () => {
  const engine = new TestStorageEngine();
  const client = new StorageClient({
    engine,
    environment: 'test-addItem',
    getId: () => 'test-id',
    getNow: () => '2020-01-01T00:00:00',
    logger: new TestLogger(),
  });
  await expect(
    client.addItem({
      item: {
        testHashKey: 'test-hash-key',
        firstSortKeyComponent: 'first-sort-key-component',
      },
      table: {
        hashKeys: ['testHashKey'],
        sortKeys: ['firstSortKeyComponent', 'secondSortKeyComponent'],
        name: 'test-table',
      },
    })
  ).rejects.toThrow(MissingKeyError);
});
