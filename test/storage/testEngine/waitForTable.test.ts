import TestStorageEngine from '@src/storage/testEngine';

test('waits for table', async () => {
  const engine = new TestStorageEngine({
    tables: { 'test-table': { hashKey: 'testHashKey', status: 'CREATING' } },
  });
  const promise = engine.waitForTable({ tableName: 'test-table' });
  let hasResolved = false;
  promise.then(() => {
    hasResolved = true;
  });
  expect(hasResolved).toBe(false);
  engine.finishCreatingTable({ tableName: 'test-table' });
  await promise;
  expect(hasResolved).toBe(true);
});
