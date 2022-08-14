import type { Item } from '@src/storage/engineType';

interface StorageClient {
  addItem: (input: AddItemInput) => Promise<Item>;
  getItems: (input: GetItemsInput) => Promise<Item[]>;
}

export interface AddItemInput {
  item: Item;
  table: {
    hashKeys: string[];
    name: string;
    sortKeys?: string[];
  };
}

export interface GetItemsInput {
  hashKeyName: string;
  hashKeyValue: string;
  tableName: string;
}

export default StorageClient;
