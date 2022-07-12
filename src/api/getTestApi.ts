import Api from '@src/api/api';
import type IStorageClient from '@src/storage/clientType';
import getTestClient from '@src/storage/getTestClient';

const getTestApi = ({
  now = '2020-01-01T00:00:00',
  storageClient = getTestClient().client,
  userId = 'test-user-id',
}: {
  now?: string;
  storageClient?: IStorageClient;
  userId?: string;
} = {}) =>
  new Api({
    getNow: () => now,
    storageClient,
    parseUserId: () => userId,
  });

export default getTestApi;
