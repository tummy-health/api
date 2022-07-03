interface StorageClient {
  addItem: (input: {
    getId: () => string;
    getNow: () => string;
    item: Item;
    table: {
      hashKeys: string[];
      name: string;
      sortKeys?: string[];
    };
  }) => Promise<Item>;
}

export type Item = Record<number | string, boolean | number | string>;

export default StorageClient;
