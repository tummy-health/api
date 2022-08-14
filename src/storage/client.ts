import { DateTime } from 'luxon';
import { v4 as getUuid } from 'uuid';

import Logger from '@src/logging/loggerType';
import IStorageClient, { AddItemInput } from '@src/storage/clientType';
import StorageEngine, { Item } from '@src/storage/engineType';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingTableError from '@src/storage/missingTableError';

class StorageClient implements IStorageClient {
  readonly engine: StorageEngine;

  readonly environment: string;

  readonly getId: () => string;

  readonly getNow: () => string;

  readonly logger: Logger;

  constructor({
    engine,
    environment,
    getId = getUuid,
    getNow = () => DateTime.now().toUTC().toISO(),
    logger,
  }: {
    engine: StorageEngine;
    environment: string;
    getId?: () => string;
    getNow?: () => string;
    logger?: Logger;
  }) {
    this.engine = engine;
    this.environment = environment;
    this.getId = getId;
    this.getNow = getNow;
    this.logger = logger;
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
      this.logger.info(`added item to table '${tableName}'`);
      return item;
    } catch (error) {
      if (error instanceof MissingTableError) {
        await this.engine.createTable({
          hashKey,
          tableName,
          sortKey,
        });
        this.logger.info(`created table '${tableName}'`);
        await this.engine.addItem({ item, tableName });
        this.logger.info(`added item to table '${tableName}'`);
        return item;
      }
      throw error;
    }
  };

  getItems = async ({ hashKeyName, hashKeyValue, tableName }) =>
    this.engine.getItems({ hashKeyName, hashKeyValue, tableName });
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
  const { key: hashKey, value: hashKeyValue } = formatKey({
    item,
    keys: hashKeys,
  });
  const result = {
    ...item,
    createdDate: getNow(),
    [hashKey]: hashKeyValue,
    id: getId(),
  };
  if (sortKeys) {
    const { key: sortKey, value: sortKeyValue } = formatKey({
      item,
      keys: sortKeys,
    });
    result[sortKey] = sortKeyValue;
  }
  return result;
};

const formatKey = ({
  item,
  keys,
}: {
  item: Item;
  keys: string[];
}): { key: string; value: boolean | number | string } => {
  const values = keys.map((key) => {
    if (!(key in item)) throw new MissingKeyError();
    return item[key];
  });
  return {
    key: createCompositeValue({ values: keys }) as string,
    value: createCompositeValue({ values }),
  };
};

const createCompositeValue = ({
  values,
}: {
  values?: (boolean | number | string)[];
}): boolean | number | string | undefined => {
  if (!values) return undefined;
  if (values.length === 1) return values[0];
  return values.join('|');
};

export default StorageClient;
