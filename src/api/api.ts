import { ApolloServer } from 'apollo-server-lambda';
import { DocumentNode } from 'graphql';

import {
  resolvers as entriesResolvers,
  schema as entriesSchema,
} from '@src/endpoints/entries';
import {
  resolvers as saveEntryResolvers,
  schema as saveEntrySchema,
} from '@src/endpoints/saveEntry';
import type Logger from '@src/logging/loggerType';
import type IStorageClient from '@src/storage/clientType';

class Api {
  readonly server: ApolloServer;

  readonly storageClient: IStorageClient;

  constructor({
    logger,
    storageClient,
    parseUserId,
  }: {
    logger: Logger;
    storageClient: IStorageClient;
    parseUserId: () => string;
  }) {
    this.storageClient = storageClient;
    this.server = new ApolloServer({
      context: () => ({
        logger,
        storageClient,
        userId: parseUserId(),
      }),
      plugins: [getLoggingMiddleware({ logger })],
      resolvers,
      typeDefs: schema,
    });
  }

  createHandler() {
    return this.server.createHandler();
  }

  execute({
    query,
    variables,
  }: {
    query: DocumentNode;
    variables?: Record<string, boolean | number | string>;
  }) {
    return this.server.executeOperation({ query, variables });
  }
}

const getLoggingMiddleware = ({ logger }: { logger: Logger }) => ({
  requestDidStart: async ({ request: { query = '' } }) => {
    logger.info(query);
    return {
      didEncounterErrors: async ({ errors }) => {
        errors.forEach((error) => {
          logger.error(error);
        });
      },
    };
  },
});

const resolvers = [entriesResolvers, saveEntryResolvers];

const schema = [entriesSchema, saveEntrySchema];

export default Api;
