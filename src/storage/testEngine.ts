import IStorageEngine, {
  AddItemInput,
  CreateTableInput,
  GetItemsInput,
  Item,
} from '@src/storage/engineType';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingTableError from '@src/storage/missingTableError';
import ExistingTableError from '@src/storage/existingTableError';

class TestStorageEngine implements IStorageEngine {
  readonly items: Items;

  readonly tables: Tables;

  constructor({
    items = {},
    tables = {},
  }: { items?: Items; tables?: Tables } = {}) {
    this.items = items;
    this.tables = tables;
  }

  addItem = async ({ item, tableName }: AddItemInput) => {
    if (!(tableName in this.tables)) throw new MissingTableError({ tableName });
    if (!(tableName in this.items)) this.items[tableName] = {};
    const { hashKey, sortKey } = this.tables[tableName];
    const key = getKey({ hashKey, item, sortKey });
    this.items[tableName][key] = item;
    return item;
  };

  createTable = async ({ hashKey, sortKey, tableName }: CreateTableInput) => {
    if (tableName in this.tables) throw new ExistingTableError({ tableName });
    this.tables[tableName] = { hashKey, sortKey };
  };

  getItems = async ({
    hashKeyValue,
    tableName,
  }: GetItemsInput): Promise<Item[]> => {
    if (!(tableName in this.tables)) throw new MissingTableError({ tableName });
    const items = this.items[tableName];
    if (!items) return [];
    const matchingItems = Object.entries(items)
      .filter(([key]) => key.split('+')[0] === hashKeyValue)
      .map((entry) => entry[1]);
    return matchingItems;
  };
}

export type Items = Record<string, Record<string, Item>>;

export type Tables = Record<string, { hashKey: string; sortKey?: string }>;

const getKey = ({ hashKey, item, sortKey }) => {
  if (!(hashKey in item)) throw new MissingKeyError();
  if (!sortKey) return item[hashKey];
  if (!(sortKey in item)) throw new MissingKeyError();
  return `${item[hashKey]}+${item[sortKey]}`;
};

export default TestStorageEngine;
