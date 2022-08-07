import TestStorageEngine from '@src/storage/testEngine';
import ExistingTableError from '@src/storage/existingTableError';

test('creates table', async () => {
  const engine = new TestStorageEngine();
  await engine.createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName: 'test-table',
  });
  expect(engine.tables['test-table']).toMatchObject({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
  });
});

test('creates table without sort key', async () => {
  const engine = new TestStorageEngine();
  await engine.createTable({
    hashKey: 'testHashKey',
    tableName: 'test-table',
  });
  expect(engine.tables['test-table']).toMatchObject({
    hashKey: 'testHashKey',
  });
});

test('throws error if table exists', async () => {
  const engine = new TestStorageEngine({
    tables: { 'test-table': { hashKey: 'testHashKey' } },
  });
  await expect(
    engine.createTable({
      hashKey: 'testHashKey',
      tableName: 'test-table',
    })
  ).rejects.toThrow(ExistingTableError);
});
