import { gql } from 'apollo-server-lambda';

import getTestApi from '@src/api/getTestApi';
import getTestClient from '@src/storage/getTestClient';

const query = gql`
  mutation SaveEntry($date: String!, $notes: String!, $ratingOutOfFive: Int!) {
    saveEntry(
      input: { date: $date, notes: $notes, ratingOutOfFive: $ratingOutOfFive }
    ) {
      createdDate
      date
      id
      notes
      ratingOutOfFive
      userId
    }
  }
`;

test('saves and returns entry', async () => {
  const { client: storageClient, engine } = getTestClient({
    environment: 'test',
    id: 'test-id',
    now: '2022-01-01T00:00:00',
  });
  const api = getTestApi({
    storageClient,
    userId: 'test-user-id',
  });
  const response = await api.execute({
    query,
    variables: {
      date: '2020-01-01',
      notes: 'test notes',
      ratingOutOfFive: 3,
    },
  });
  const {
    data: { saveEntry: returnedEntry },
  } = response;
  const savedEntry = engine.items['test-entries']['test-user-id+2020-01-01'];
  const expectedEntry = {
    createdDate: '2022-01-01T00:00:00',
    date: '2020-01-01',
    id: 'test-id',
    notes: 'test notes',
    ratingOutOfFive: 3,
    userId: 'test-user-id',
  };
  expect(savedEntry).toMatchObject(expectedEntry);
  expect(returnedEntry).toMatchObject(expectedEntry);
});
