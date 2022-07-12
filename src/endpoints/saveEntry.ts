import { gql } from 'apollo-server-lambda';

export const resolvers = {
  Mutation: {
    saveEntry: async (
      _source,
      { input: { date, notes, ratingOutOfFive } },
      { environment, getId, getNow, storageClient, userId }
    ) =>
      storageClient.addItem({
        environment,
        getId,
        getNow,
        item: {
          date,
          notes,
          ratingOutOfFive,
          userId,
        },
        table: {
          hashKeys: ['userId'],
          name: 'entries',
          sortKeys: ['date'],
        },
      }),
  },
};

export const schema = gql`
  input SaveEntryInput {
    date: String!
    notes: String
    ratingOutOfFive: Int!
  }

  type Entry {
    createdDate: String!
    date: String!
    id: ID!
    notes: String
    ratingOutOfFive: Int!
    userId: String!
  }

  type Mutation {
    saveEntry(input: SaveEntryInput!): Entry
  }
`;
