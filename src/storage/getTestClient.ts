import StorageClient from '@src/storage/client';
import TestStorageEngine, { Items, Tables } from '@src/storage/testEngine';

const getTestClient = ({
  environment = 'test',
  id = 'test-id',
  items,
  now = '2020-01-01T00:00:00',
  tables,
}: {
  environment?: string;
  id?: string;
  items?: Items;
  now?: string;
  tables?: Tables;
} = {}) => {
  const engine = new TestStorageEngine({ items, tables });
  const client = new StorageClient({
    engine,
    environment,
    getId: () => id,
    getNow: () => now,
  });
  return { client, engine };
};

export default getTestClient;
