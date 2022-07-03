import { ApolloServer, gql } from 'apollo-server-lambda';
import { DocumentNode } from 'graphql';
import { DateTime } from 'luxon';

import {
  resolvers as saveEntryResolvers,
  schema as saveEntrySchema,
} from '@src/api/saveEntry';
import TestStorageClient from '@src/storage/testStorageClient';
import StorageClient from '@src/storage/types';

class Api {
  readonly server: ApolloServer;

  readonly storageClient: StorageClient;

  constructor({
    environment,
    getId,
    getNow,
    storageClient,
    parseUserId,
  }: {
    environment: string;
    getId: () => string;
    getNow: () => string;
    storageClient: StorageClient;
    parseUserId: () => string;
  }) {
    this.storageClient = storageClient;
    this.server = new ApolloServer({
      context: () => ({
        environment,
        getId,
        getNow,
        storageClient,
        userId: parseUserId(),
      }),
      resolvers,
      typeDefs: schema,
    });
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

const resolvers = [saveEntryResolvers];

const schema = [
  saveEntrySchema,
  gql`
    type Query {
      placeholder: String!
    }
  `,
];

export class TestApi extends Api {
  constructor({
    environment = 'development',
    id = 'test-id',
    now = '2020-01-01T00:00:00',
    storageClient = new TestStorageClient(),
    userId = 'test-user-id',
  }: {
    environment?: string;
    id?: string;
    now?: string;
    storageClient?: TestStorageClient;
    userId?: string;
  }) {
    super({
      environment,
      getId: () => id,
      getNow: () => DateTime.fromISO(now, { zone: 'UTC' }).toISO(),
      storageClient,
      parseUserId: () => userId,
    });
  }
}

export default Api;
