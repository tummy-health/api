interface StorageEngine {
  addItem: (input: AddItemInput) => Promise<Item>;

  createTable: (input: CreateTableInput) => Promise<void>;

  describeTable: (input: DescribeTableInput) => Promise<TableDescription>;

  waitForTable: (input: WaitForTableInput) => Promise<void>;
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

export interface DescribeTableInput {
  tableName: string;
}

export interface WaitForTableInput {
  tableName: string;
}

export default StorageEngine;
