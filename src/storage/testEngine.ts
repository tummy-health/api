import IStorageEngine, {
  AddItemInput,
  CreateTableInput,
  DescribeTableInput,
  Item,
  WaitForTableInput,
} from '@src/storage/engineType';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingTableError from '@src/storage/missingTableError';
import ExistingTableError from '@src/storage/existingTableError';
import wait from '@src/utils/wait';

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

  describeTable = async ({ tableName }: DescribeTableInput) => {
    const { hashKey, sortKey, status = 'ACTIVE' } = this.tables[tableName];
    return {
      hashKey,
      sortKey,
      status,
    };
  };

  finishCreatingTable = async ({ tableName }) => {
    this.tables[tableName].status = 'ACTIVE';
  };

  waitForTable = async ({ tableName }: WaitForTableInput) => {
    let hasFinished = false;
    do {
      const { status } = await this.describeTable({ tableName }); // eslint-disable-line no-await-in-loop
      hasFinished = status === 'ACTIVE';
      await wait({ seconds: 0.1 }); // eslint-disable-line no-await-in-loop
    } while (!hasFinished);
  };
}

type Items = Record<string, Record<string, Item>>;

type Tables = Record<
  string,
  { hashKey: string; sortKey?: string; status?: string }
>;

const getKey = ({ hashKey, item, sortKey }) => {
  if (!(hashKey in item)) throw new MissingKeyError();
  if (!sortKey) return item[hashKey];
  if (!(sortKey in item)) throw new MissingKeyError();
  return `${item[hashKey]}|${item[sortKey]}`;
};

export default TestStorageEngine;
