import { gql } from 'apollo-server-lambda';

import { TestApi } from '@src/api';
import TestStorageClient from '@src/storage/testStorageClient';

const query = gql`
  mutation SaveEntry(
    $date: String!
    $notes: String!
    $ratingOutOfFive: Int!
    $revision: Int!
  ) {
    saveEntry(
      input: {
        date: $date
        notes: $notes
        ratingOutOfFive: $ratingOutOfFive
        revision: $revision
      }
    ) {
      createdDate
      date
      id
      notes
      ratingOutOfFive
      revision
      userId
    }
  }
`;

test('saves and returns entry', async () => {
  const storageClient = new TestStorageClient();
  const api = new TestApi({
    environment: 'development',
    id: 'test-id',
    now: '2022-01-01T00:00:00',
    storageClient,
    userId: 'test-user-id',
  });
  const {
    data: { saveEntry: returnedEntry },
  } = await api.execute({
    query,
    variables: {
      date: '2020-01-01',
      notes: 'test notes',
      ratingOutOfFive: 3,
      revision: 0,
    },
  });
  const savedEntry =
    storageClient.items['development-entries']['test-user-id+2020-01-01|0'];
  const expectedEntry = {
    createdDate: '2022-01-01T00:00:00.000Z',
    date: '2020-01-01',
    id: 'test-id',
    notes: 'test notes',
    ratingOutOfFive: 3,
    revision: 0,
    userId: 'test-user-id',
  };
  expect(savedEntry).toMatchObject(expectedEntry);
  expect(returnedEntry).toMatchObject(expectedEntry);
});
