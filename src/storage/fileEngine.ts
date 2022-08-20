import { promises as fs } from 'fs';

import Logger from '@src/logging/logger';
import ILogger from '@src/logging/loggerType';
import IStorageEngine, {
  AddItemInput,
  CreateTableInput,
  GetItemsInput,
  Item,
} from '@src/storage/engineType';
import ExistingTableError from '@src/storage/existingTableError';
import MissingKeyError from '@src/storage/missingKeyError';
import MissingLocationError from '@src/storage/missingLocationError';
import MissingTableError from '@src/storage/missingTableError';

class FileStorageEngine implements IStorageEngine {
  private readonly dbName: string;

  private readonly dbRoot: string;

  private readonly fileDbRoot: string;

  private readonly location: string;

  private readonly logger: ILogger;

  constructor({
    dbName = 'default',
    location = '.',
    logger = new Logger(),
  }: {
    dbName?: string;
    location?: string;
    logger?: ILogger;
  } = {}) {
    this.dbName = dbName;
    this.location = location;
    this.logger = logger;
    this.fileDbRoot = `${location}/.filedb`;
    this.dbRoot = `${this.fileDbRoot}/${dbName}`;
  }

  addItem = async ({ item, tableName }: AddItemInput) => {
    await verifyLocationExists({ location: this.dbRoot });
    const tables = await getTables({ dbRoot: this.dbRoot });
    if (!(tableName in tables)) throw new MissingTableError({ tableName });
    const { hashKey, sortKey } = tables[tableName];
    const key = getKey({ hashKey, item, sortKey });
    const items = await getItems({ dbRoot: this.dbRoot, tableName });
    items[key] = item;
    await fs.writeFile(
      `${this.dbRoot}/${tableName}.json`,
      JSON.stringify(items)
    );
    return item;
  };

  private createDbIfNecessary = async () => {
    await verifyLocationExists({ location: this.location });
    const hasDbRoot = await this.hasDbRoot();
    if (!hasDbRoot) await this.createDbRoot();
  };

  createTable = async ({ hashKey, sortKey, tableName }: CreateTableInput) => {
    await this.createDbIfNecessary();
    const tables = await getTables({ dbRoot: this.dbRoot });
    if (tableName in tables) throw new ExistingTableError({ tableName });
    tables[tableName] = { hashKey, sortKey };
    await fs.writeFile(`${this.dbRoot}/tables.json`, JSON.stringify(tables));
  };

  private createDbRoot = async () => {
    try {
      await verifyLocationExists({ location: this.fileDbRoot });
    } catch (error) {
      if (!(error instanceof MissingLocationError)) throw error;
      await fs.mkdir(this.fileDbRoot);
      this.logger.info(`created fileDb root at '${this.fileDbRoot}'`);
    }
    try {
      await verifyLocationExists({ location: this.dbRoot });
    } catch (error) {
      if (!(error instanceof MissingLocationError)) throw error;
      await fs.mkdir(this.dbRoot);
      this.logger.info(`created db root at '${this.dbRoot}'`);
    }
  };

  getItems = async ({ hashKeyValue, tableName }: GetItemsInput) => {
    await verifyLocationExists({ location: this.dbRoot });
    const tables = await getTables({ dbRoot: this.dbRoot });
    if (!(tableName in tables)) throw new MissingTableError({ tableName });
    const items = await getItems({ dbRoot: this.dbRoot, tableName });
    if (!items) return [];
    const matchingItems = Object.entries(items)
      .filter(([key]) => key.split('+')[0] === hashKeyValue)
      .map((entry) => entry[1]);
    return matchingItems as Item[];
  };

  private hasDbRoot = async () => {
    try {
      await verifyLocationExists({ location: this.fileDbRoot });
      await verifyLocationExists({ location: this.dbRoot });
    } catch (error) {
      if (!(error instanceof MissingLocationError)) throw error;
      return false;
    }
    return true;
  };
}

const getItems = async ({
  dbRoot,
  tableName,
}: {
  dbRoot: string;
  tableName: string;
}) => readJson({ fileName: `${dbRoot}/${tableName}.json` });

const getKey = ({ hashKey, item, sortKey }) => {
  if (!(hashKey in item)) throw new MissingKeyError();
  if (!sortKey) return item[hashKey];
  if (!(sortKey in item)) throw new MissingKeyError();
  return `${item[hashKey]}+${item[sortKey]}`;
};

const getTables = async ({ dbRoot }: { dbRoot: string }) =>
  readJson({ fileName: `${dbRoot}/tables.json` });

const readJson = async ({ fileName }: { fileName: string }) => {
  try {
    const contents = await fs.readFile(fileName, 'utf-8');
    return JSON.parse(contents);
  } catch (error) {
    return {};
  }
};

const verifyLocationExists = async ({ location }: { location: string }) => {
  try {
    await fs.lstat(location);
  } catch (error) {
    if (error.message.startsWith('ENOENT: no such file or directory'))
      throw new MissingLocationError({ location });
    throw error;
  }
};

export default FileStorageEngine;
