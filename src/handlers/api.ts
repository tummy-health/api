import Api from '@src/api/api';
import Logger from '@src/logging/logger';
import StorageClient from '@src/storage/client';
import DynamoStorageEngine from '@src/storage/dynamoEngine';
import env from '@src/env';

const logger = new Logger({ level: env.logLevel });

const storageEngine = new DynamoStorageEngine({
  id: env.storageId,
  logger,
  region: env.storageRegion,
  secret: env.storageSecret,
});
const storageClient = new StorageClient({
  environment: env.environment,
  logger,
  engine: storageEngine,
});

const api = new Api({
  logger,
  parseUserId: () => 'test-user-id',
  storageClient,
});

export default api.createHandler();
