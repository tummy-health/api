import type { Item } from '@src/storage/engineType';

interface StorageClient {
  addItem: (input: AddItemInput) => Promise<Item>;
}

export interface AddItemInput {
  item: Item;
  table: {
    hashKeys: string[];
    name: string;
    sortKeys?: string[];
  };
}

export default StorageClient;
