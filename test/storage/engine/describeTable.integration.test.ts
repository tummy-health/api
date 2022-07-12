import { v4 as uuid } from 'uuid';

import env from '@src/env';
import StorageEngine from '@src/storage/engine';
import MissingTableError from '@src/storage/missingTableError';
import { createTable, deleteAllTables } from '@test/storage/engine/utils';

const ENVIRONMENT = 'integrationTest-describeTable';

jest.setTimeout(10000);

afterAll(async () => {
  await deleteAllTables({
    prefix: ENVIRONMENT,
    region: env.storageRegion,
    storageId: env.storageId,
    storageSecret: env.storageSecret,
  });
});

test('describes table', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    region: env.storageRegion,
    sortKey: 'testSortKey',
    storageId: env.storageId,
    storageSecret: env.storageSecret,
    tableName,
  });
  const engine = new StorageEngine({
    id: env.storageId,
    region: env.storageRegion,
    secret: env.storageSecret,
  });
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
    region: env.storageRegion,
    storageId: env.storageId,
    storageSecret: env.storageSecret,
    tableName,
  });
  const engine = new StorageEngine({
    id: env.storageId,
    region: env.storageRegion,
    secret: env.storageSecret,
  });
  const tableDescription = await engine.describeTable({
    tableName,
  });
  expect(tableDescription).toMatchObject({
    hashKey: 'testHashKey',
  });
});

test('throws error if table does not exist', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  const engine = new StorageEngine({
    id: env.storageId,
    region: env.storageRegion,
    secret: env.storageSecret,
  });
  expect(
    engine.describeTable({
      tableName,
    })
  ).rejects.toThrow(MissingTableError);
});
