import { ApolloServer, gql } from 'apollo-server-lambda';
import { DocumentNode } from 'graphql';

import {
  resolvers as saveEntryResolvers,
  schema as saveEntrySchema,
} from '@src/endpoints/saveEntry';
import type IStorageClient from '@src/storage/clientType';

class Api {
  readonly server: ApolloServer;

  readonly storageClient: IStorageClient;

  constructor({
    getNow,
    storageClient,
    parseUserId,
  }: {
    getNow: () => string;
    storageClient: IStorageClient;
    parseUserId: () => string;
  }) {
    this.storageClient = storageClient;
    this.server = new ApolloServer({
      context: () => ({
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

export default Api;
