import { v4 as uuid } from 'uuid';

import env from '@src/env';
import StorageEngine from '@src/storage/engine';
import {
  createTable,
  deleteAllTables,
  describeTable,
} from '@test/storage/engine/utils';

const ENVIRONMENT = 'integrationTest-waitForTable';

jest.setTimeout(10000);

afterAll(async () => {
  await deleteAllTables({
    prefix: ENVIRONMENT,
    region: env.storageRegion,
    storageId: env.storageId,
    storageSecret: env.storageSecret,
  });
});

test('waits for table', async () => {
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
  await engine.waitForTable({ tableName });
  const {
    Table: { TableStatus: status },
  } = await describeTable({
    region: env.storageRegion,
    storageId: env.storageId,
    storageSecret: env.storageSecret,
    tableName,
  });
  expect(status).toBe('ACTIVE');
});
