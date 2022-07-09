import { v4 as uuid } from 'uuid';

import StorageEngine from '@src/storage/engine';
import {
  createTable,
  deleteTable,
  describeTable,
  listTables,
} from '@test/storage/engine/utils';

const ENVIRONMENT = 'integrationTest-waitForTable';

jest.setTimeout(10000);

afterAll(async () => {
  const { TableNames: tableNames } = await listTables({ prefix: ENVIRONMENT });
  const promises = tableNames.map((tableName) => deleteTable({ tableName }));
  await Promise.all(promises);
});

test('waits for table', async () => {
  const tableName = `${ENVIRONMENT}-${uuid()}`;
  await createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName,
  });
  const engine = new StorageEngine();
  await engine.waitForTable({ tableName });
  const {
    Table: { TableStatus: status },
  } = await describeTable({ tableName });
  expect(status).toBe('ACTIVE');
});
