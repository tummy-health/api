import { v4 as uuid } from 'uuid';

import StorageEngine from '@src/storage/engine';
import MissingTableError from '@src/storage/missingTableError';
import { createTable, deleteTable, listTables } from '@test/storage/utils';

const ENVIRONMENT = 'integrationTest-describeTable';

jest.setTimeout(10000);

afterAll(async () => {
  const { TableNames: tableNames } = await listTables({ prefix: ENVIRONMENT });
  const promises = tableNames.map((tableName) => deleteTable({ tableName }));
  await Promise.all(promises);
});

test('describes table', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName,
  });
  const engine = new StorageEngine();
  const tableDescription = await engine.describeTable({
    tableName,
  });
  expect(tableDescription).toMatchObject({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
  });
});

test('describes table without sort key', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    tableName,
  });
  const engine = new StorageEngine();
  const tableDescription = await engine.describeTable({
    tableName,
  });
  expect(tableDescription).toMatchObject({
    hashKey: 'testHashKey',
  });
});

test('throws error if table does not exist', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  const engine = new StorageEngine();
  expect(
    engine.describeTable({
      tableName,
    })
  ).rejects.toThrow(MissingTableError);
});
