import type Logger from '@src/logging/loggerType';
import TestLogger from '@src/logging/testLogger';
import StorageClient from '@src/storage/client';
import TestStorageEngine, { Items, Tables } from '@src/storage/testEngine';

const getTestClient = ({
  environment = 'test',
  id = 'test-id',
  items,
  logger = new TestLogger(),
  now = '2020-01-01T00:00:00',
  tables,
}: {
  environment?: string;
  id?: string;
  items?: Items;
  logger?: Logger;
  now?: string;
  tables?: Tables;
} = {}) => {
  const engine = new TestStorageEngine({ items, tables });
  const client = new StorageClient({
    engine,
    environment,
    getId: () => id,
    getNow: () => now,
    logger,
  });
  return { client, engine };
};

export default getTestClient;
