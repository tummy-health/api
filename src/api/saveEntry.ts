import { gql } from 'apollo-server-lambda';

export const resolvers = {
  Mutation: {
    saveEntry: async (
      _source,
      { input: { date, notes, ratingOutOfFive, revision } },
      { environment, getId, getNow, storageClient, userId }
    ) =>
      storageClient.addItem({
        getId,
        getNow,
        item: {
          date,
          notes,
          ratingOutOfFive,
          revision,
          userId,
        },
        table: {
          hashKeys: ['userId'],
          name: `${environment}-entries`,
          sortKeys: ['date', 'revision'],
        },
      }),
  },
};

export const schema = gql`
  input SaveEntryInput {
    date: String!
    notes: String
    ratingOutOfFive: Int!
    revision: Int!
  }

  type Entry {
    createdDate: String!
    date: String!
    id: ID!
    notes: String
    ratingOutOfFive: Int!
    revision: Int!
    userId: String!
  }

  type Mutation {
    saveEntry(input: SaveEntryInput!): Entry
  }
`;
