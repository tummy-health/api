import TestStorageEngine from '@src/storage/testEngine';

test('describes table', async () => {
  const engine = new TestStorageEngine({
    tables: {
      'test-table': {
        hashKey: 'testHashKey',
        sortKey: 'testSortKey',
        status: 'CREATING',
      },
    },
  });
  const tableDescription = await engine.describeTable({
    tableName: 'test-table',
  });
  expect(tableDescription).toMatchObject({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    status: 'CREATING',
  });
});

test('describes table without sort key', async () => {
  const engine = new TestStorageEngine({
    tables: {
      'test-table': {
        hashKey: 'testHashKey',
        status: 'CREATING',
      },
    },
  });
  const tableDescription = await engine.describeTable({
    tableName: 'test-table',
  });
  expect(tableDescription).toMatchObject({
    hashKey: 'testHashKey',
    status: 'CREATING',
  });
});

test('describes table without status', async () => {
  const engine = new TestStorageEngine({
    tables: {
      'test-table': {
        hashKey: 'testHashKey',
      },
    },
  });
  const tableDescription = await engine.describeTable({
    tableName: 'test-table',
  });
  expect(tableDescription).toMatchObject({
    hashKey: 'testHashKey',
    status: 'ACTIVE',
  });
});
