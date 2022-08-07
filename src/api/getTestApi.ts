import Api from '@src/api/api';
import type Logger from '@src/logging/loggerType';
import TestLogger from '@src/logging/testLogger';
import type IStorageClient from '@src/storage/clientType';
import getTestClient from '@src/storage/getTestClient';

const getTestApi = ({
  logger = new TestLogger(),
  storageClient = getTestClient().client,
  userId = 'test-user-id',
}: {
  logger?: Logger;
  storageClient?: IStorageClient;
  userId?: string;
} = {}) =>
  new Api({
    logger,
    storageClient,
    parseUserId: () => userId,
  });

export default getTestApi;
