import IStorageClient, { AddItemInput } from '@src/storage/clientType';
import IStorageEngine, { Item } from '@src/storage/engineType';
import MissingTableError from '@src/storage/missingTableError';

class StorageClient implements IStorageClient {
  readonly engine: IStorageEngine;

  readonly environment: string;

  readonly getId: () => string;

  readonly getNow: () => string;

  constructor({
    engine,
    environment,
    getId,
    getNow,
  }: {
    engine: IStorageEngine;
    environment: string;
    getId: () => string;
    getNow: () => string;
  }) {
    this.engine = engine;
    this.environment = environment;
    this.getId = getId;
    this.getNow = getNow;
  }

  addItem = async ({
    item: itemWithoutMetadata,
    table: { hashKeys, name, sortKeys },
  }: AddItemInput) => {
    const tableName = `${this.environment}-${name}`;
    const hashKey = createCompositeValue({ values: hashKeys }) as string;
    const sortKey = createCompositeValue({ values: sortKeys }) as string;
    const item = formatItem({
      getId: this.getId,
      getNow: this.getNow,
      hashKeys,
      item: itemWithoutMetadata,
      sortKeys,
    });
    try {
      await this.engine.addItem({ item, tableName });
      return item;
    } catch (error) {
      if (error instanceof MissingTableError) {
        await this.engine.createTable({
          hashKey,
          tableName,
          sortKey,
        });
        await this.engine.waitForTable({ tableName });
        await this.engine.addItem({ item, tableName });
        return item;
      }
      throw error;
    }
  };
}

const formatItem = ({
  getId,
  getNow,
  hashKeys,
  item,
  sortKeys,
}: {
  getId: () => string;
  getNow: () => string;
  hashKeys: string[];
  item: Item;
  sortKeys?: string[];
}): Item => {
  const hashKeyValues = hashKeys.map((key) => item[key]);
  const formattedHashKey = createCompositeValue({
    values: hashKeys,
  }) as string;
  const formattedHashKeyValue = createCompositeValue({ values: hashKeyValues });
  const result = {
    ...item,
    createdDate: getNow(),
    [formattedHashKey]: formattedHashKeyValue,
    id: getId(),
  };
  if (sortKeys) {
    const sortKeyValues = sortKeys?.map((key) => item[key]);
    const formattedSortKey = createCompositeValue({
      values: sortKeys,
    }) as string;
    const formattedSortKeyValue = createCompositeValue({
      values: sortKeyValues,
    });
    result[formattedSortKey] = formattedSortKeyValue;
  }
  return result;
};

const createCompositeValue = ({
  values,
}: {
  values?: (boolean | number | string)[];
}) => {
  if (!values) return undefined;
  if (values.length === 1) return values[0];
  return values.join('|');
};

export default StorageClient;
