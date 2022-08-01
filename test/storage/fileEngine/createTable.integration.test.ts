import { promises as fs } from 'fs';
import { v4 as getUuid } from 'uuid';

import TestLogger from '@src/logging/testLogger';
import ExistingTableError from '@src/storage/existingTableError';
import FileStorageEngine from '@src/storage/fileEngine';
import MissingLocationError from '@src/storage/missingLocationError';
import {
  createDirectoryIfMissing,
  readFile,
  removeAll,
} from '@test/storage/fileEngine/utils';

const PREFIX = 'integrationTest-createTable';

afterAll(async () => {
  await fs.rm('./test-filedb-root-createTable', { recursive: true });
  await removeAll({ prefix: PREFIX });
});

test('throws error if location does not exist', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  const engine = new FileStorageEngine({
    dbName,
    location: './bad/bad/bad',
    logger: new TestLogger(),
  });
  await expect(
    engine.createTable({
      hashKey: 'testHashKey',
      sortKey: 'testSortKey',
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingLocationError);
});

test('creates db folder if filedb folder does not exist', async () => {
  await fs.mkdir('./test-filedb-root-createTable');
  const dbName = `${PREFIX}-${getUuid()}`;
  const engine = new FileStorageEngine({
    dbName,
    location: './test-filedb-root-createTable',
    logger: new TestLogger(),
  });
  await engine.createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName: 'test-table',
  });
  await expect(
    fs.lstat('./test-filedb-root-createTable/.filedb')
  ).resolves.not.toThrow();
});

test('creates db folder if db folder does not exist', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await engine.createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName: 'test-table',
  });
  await expect(fs.lstat(`./.filedb/${dbName}`)).resolves.not.toThrow();
});

test('creates table', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await engine.createTable({
    hashKey: 'testHashKey',
    sortKey: 'testSortKey',
    tableName: 'test-table',
  });
  expect(
    await readFile({ name: `./.filedb/${dbName}/tables.json` })
  ).toMatchObject({
    'test-table': {
      hashKey: 'testHashKey',
      sortKey: 'testSortKey',
    },
  });
});

test('creates table without sort key', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await engine.createTable({
    hashKey: 'testHashKey',
    tableName: 'test-table',
  });
  expect(
    await readFile({ name: `./.filedb/${dbName}/tables.json` })
  ).toMatchObject({
    'test-table': {
      hashKey: 'testHashKey',
    },
  });
});

test('throws error if table exists', async () => {
  await createDirectoryIfMissing({ directory: './.filedb' });
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir(`./.filedb/${dbName}`);
  await fs.writeFile(
    `./.filedb/${dbName}/tables.json`,
    JSON.stringify({ 'test-table': { hashKey: 'testHashKey' } })
  );
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await expect(
    engine.createTable({
      hashKey: 'testHashKey',
      tableName: 'test-table',
    })
  ).rejects.toThrow(ExistingTableError);
});
