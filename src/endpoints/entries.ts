import { gql } from 'apollo-server-lambda';

import MissingTableError from '@src/storage/missingTableError';

export const resolvers = {
  Query: {
    entries: async (_source, _input, { logger, storageClient, userId }) => {
      try {
        const items = await storageClient.getItems({
          hashKeyName: 'userId',
          hashKeyValue: userId,
          tableName: 'entries',
        });
        return items;
      } catch (error) {
        if (error instanceof MissingTableError) {
          logger.info('entries table does not exist, returning empty list');
          return [];
        }
        logger.error(error);
        throw error;
      }
    },
  },
};

export const schema = gql`
  type Entry {
    createdDate: String!
    date: String!
    id: ID!
    notes: String
    ratingOutOfFive: Int!
    userId: String!
  }

  type Query {
    entries: [Entry]
  }
`;
