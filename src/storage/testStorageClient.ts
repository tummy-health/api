import IStorageClient, { Item } from '@src/storage/types';

class TestStorageClient implements IStorageClient {
  readonly items: Items;

  readonly tables: Tables;

  constructor({
    items = {},
    tables = {},
  }: {
    items?: Items;
    tables?: Tables;
  } = {}) {
    this.items = items;
    this.tables = tables;
  }

  addItem = async ({
    getId,
    getNow,
    item,
    table: { hashKeys, name, sortKeys },
  }) => {
    this.tables[name] = { hashKeys, sortKeys };
    if (!(name in this.items)) this.items[name] = {};
    const key = buildItemKey({ hashKeys, item, sortKeys });
    const itemToSave = { ...item, createdDate: getNow(), id: getId() };
    this.items[name][key] = itemToSave;
    return itemToSave;
  };
}

type Items = Record<string, Record<number | string, Item>>;

type Tables = Record<string, { hashKeys: string[]; sortKeys?: string[] }>;

const buildItemKey = ({ hashKeys, item, sortKeys }) => {
  const hashKey = buildKey({ item, keys: hashKeys });
  if (!sortKeys) return hashKey;
  const sortKey = buildKey({ item, keys: sortKeys });
  return `${hashKey}+${sortKey}`;
};

const buildKey = ({ item, keys }) => {
  if (keys.length === 0) return item[keys[0]];
  const values = keys.map((componentKey) => item[componentKey]);
  return values.join('|');
};

export default TestStorageClient;
