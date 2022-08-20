import { gql } from 'apollo-server-lambda';

import getTestApi from '@src/api/getTestApi';
import getTestClient from '@src/storage/getTestClient';

const query = gql`
  query GetEntries {
    entries {
      createdDate
      date
      id
      notes
      ratingOutOfFive
      userId
    }
  }
`;

test('returns entries', async () => {
  const { client: storageClient } = getTestClient({
    environment: 'test',
    items: {
      'test-entries': {
        'test-user-id+2020-01-01': {
          createdDate: '2020-01-02T00:00:00',
          date: '2020-01-01',
          id: 'test-id',
          notes: 'test notes!',
          ratingOutOfFive: 3,
          userId: 'test-user-id',
        },
      },
    },
    now: '2022-01-01T00:00:00',
    tables: {
      'test-entries': { hashKey: 'userId', sortKey: 'date' },
    },
  });
  const api = getTestApi({
    storageClient,
    userId: 'test-user-id',
  });
  const response = await api.execute({
    query,
  });
  const {
    data: { entries },
  } = response;
  expect(entries).toMatchObject([
    {
      createdDate: '2020-01-02T00:00:00',
      date: '2020-01-01',
      id: 'test-id',
      notes: 'test notes!',
      ratingOutOfFive: 3,
      userId: 'test-user-id',
    },
  ]);
});

test('returns empty list when no entries exist', async () => {
  const { client: storageClient } = getTestClient({
    environment: 'test',
    items: {},
    now: '2022-01-01T00:00:00',
    tables: {
      'test-entries': { hashKey: 'userId', sortKey: 'date' },
    },
  });
  const api = getTestApi({
    storageClient,
    userId: 'test-user-id',
  });
  const response = await api.execute({
    query,
  });
  const {
    data: { entries },
  } = response;
  expect(entries).toHaveLength(0);
});

test('returns error no entries when table does not exist', async () => {
  const { client: storageClient } = getTestClient({
    environment: 'test',
    items: {},
    now: '2022-01-01T00:00:00',
    tables: {},
  });
  const api = getTestApi({
    storageClient,
    userId: 'test-user-id',
  });
  const response = await api.execute({
    query,
  });
  const {
    data: { entries },
  } = response;
  expect(entries).toHaveLength(0);
});
