import { promises as fs } from 'fs';
import { v4 as getUuid } from 'uuid';

import TestLogger from '@src/logging/testLogger';
import FileStorageEngine from '@src/storage/fileEngine';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingLocationError from '@src/storage/missingLocationError';
import MissingTableError from '@src/storage/missingTableError';
import {
  createDirectoryIfMissing,
  readFile,
  removeAll,
  writeFile,
} from '@test/storage/fileEngine/utils';

const PREFIX = 'integrationTest-addItem';

afterAll(async () => {
  await fs.rm('./test-filedb-root-addItem', { recursive: true });
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
    engine.addItem({
      item: {
        testHashKey: 'test-hash-key',
        testSortKey: 'test-sort-key',
      },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingLocationError);
});

test('throws error if filedb folder does not exist', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir('./test-filedb-root-addItem');
  const engine = new FileStorageEngine({
    dbName,
    location: './test-filedb-root-addItem',
    logger: new TestLogger(),
  });
  await expect(
    engine.addItem({
      item: {
        testHashKey: 'test-hash-key',
        testSortKey: 'test-sort-key',
      },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingLocationError);
});

test('throws error if db folder does not exist', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await createDirectoryIfMissing({ directory: '.filedb' });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await expect(
    engine.addItem({
      item: {
        testHashKey: 'test-hash-key',
        testSortKey: 'test-sort-key',
      },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingLocationError);
});

test('throws error if tables file does not exist', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await createDirectoryIfMissing({ directory: '.filedb' });
  await fs.mkdir(`./.filedb/${dbName}`);
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await expect(
    engine.addItem({
      item: {
        testHashKey: 'test-hash-key',
        testSortKey: 'test-sort-key',
      },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingTableError);
});

test('throws error if table is not in tables file', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await createDirectoryIfMissing({ directory: '.filedb' });
  await fs.mkdir(`./.filedb/${dbName}`);
  await writeFile({
    contents: {
      'other-table': { hashKey: 'testHashKey', sortKey: 'testSortKey' },
    },
    name: `./.filedb/${dbName}/tables.json`,
  });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await expect(
    engine.addItem({
      item: {
        testHashKey: 'test-hash-key',
        testSortKey: 'test-sort-key',
      },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingTableError);
});

test('adds item', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir(`./.filedb/${dbName}`);
  await writeFile({
    contents: {
      'test-table': { hashKey: 'testHashKey', sortKey: 'testSortKey' },
    },
    name: `./.filedb/${dbName}/tables.json`,
  });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  const item = {
    booleanProperty: true,
    numericProperty: 9,
    stringProperty: 'test-value',
    testHashKey: 'test-hash-key',
    testSortKey: 'test-sort-key',
  };
  const returnedItem = await engine.addItem({
    item,
    tableName: 'test-table',
  });
  const dbContents = await readFile({
    name: `./.filedb/${dbName}/test-table.json`,
  });
  expect(returnedItem).toMatchObject(item);
  expect(dbContents['test-hash-key+test-sort-key']).toMatchObject(item);
});

test('adds item without sort key', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir(`./.filedb/${dbName}`);
  await writeFile({
    contents: {
      'test-table': { hashKey: 'testHashKey' },
    },
    name: `./.filedb/${dbName}/tables.json`,
  });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  const item = {
    testHashKey: 'test-hash-key',
  };
  const returnedItem = await engine.addItem({
    item,
    tableName: 'test-table',
  });
  const dbContents = await readFile({
    name: `./.filedb/${dbName}/test-table.json`,
  });
  expect(returnedItem).toMatchObject(item);
  expect(dbContents['test-hash-key']).toMatchObject(item);
});

test('throws error if item is missing hash key', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir(`./.filedb/${dbName}`);
  await writeFile({
    contents: {
      'test-table': { hashKey: 'testHashKey' },
    },
    name: `./.filedb/${dbName}/tables.json`,
  });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await expect(
    engine.addItem({
      item: { otherProperty: 'test-value' },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingKeyError);
});

test('throws error if item is missing sort key', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir(`./.filedb/${dbName}`);
  await writeFile({
    contents: {
      'test-table': { hashKey: 'testHashKey', sortKey: 'testSortKey' },
    },
    name: `./.filedb/${dbName}/tables.json`,
  });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  await expect(
    engine.addItem({
      item: { testHashKey: 'test-hash-key' },
      tableName: 'test-table',
    })
  ).rejects.toThrow(MissingKeyError);
});

test('overwrites item with matching key', async () => {
  const dbName = `${PREFIX}-${getUuid()}`;
  await fs.mkdir(`./.filedb/${dbName}`);
  await writeFile({
    contents: {
      'test-table': { hashKey: 'testHashKey' },
    },
    name: `./.filedb/${dbName}/tables.json`,
  });
  await writeFile({
    contents: {
      'test-hash-key': {
        otherProperty: 'test-value',
        testHashKey: 'test-hash-key',
      },
    },
    name: `./.filedb/${dbName}/test-table.json`,
  });
  const engine = new FileStorageEngine({
    dbName,
    location: '.',
    logger: new TestLogger(),
  });
  const item = {
    otherProperty: 'test-other-value',
    testHashKey: 'test-hash-key',
  };
  const returnedItem = await engine.addItem({
    item,
    tableName: 'test-table',
  });
  const dbContents = await readFile({
    name: `./.filedb/${dbName}/test-table.json`,
  });
  expect(returnedItem).toMatchObject(item);
  expect(dbContents['test-hash-key']).toMatchObject(item);
});
