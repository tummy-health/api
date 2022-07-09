interface StorageEngine {
  addItem: (input: AddItemInput) => Promise<Item>;

  createTable: (input: CreateTableInput) => Promise<void>;

  describeTable: (input: { tableName: string }) => Promise<TableDescription>;
}

export interface AddItemInput {
  item: Item;
  tableName: string;
}

export type Item = Record<string, boolean | number | string>;

export interface CreateTableInput {
  hashKey: string;
  sortKey?: string;
  tableName: string;
}

export interface TableDescription {
  hashKey: string;
  sortKey?: string;
  status: string;
}

export default StorageEngine;
