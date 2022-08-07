import Logger from '@src/logging/logger';
import { Level } from '@src/logging/loggerType';

describe('info', () => {
  test('logs info with default level', () => {
    const info = jest.fn();
    const logger = new Logger({ info });
    logger.info('test info log!');
    expect(info).toHaveBeenCalledWith('test info log!');
  });

  test('logs info with debug level', () => {
    const info = jest.fn();
    const logger = new Logger({ info, level: Level.Debug });
    logger.info('test info log!');
    expect(info).toHaveBeenCalledWith('test info log!');
  });

  test('logs info with info level', () => {
    const info = jest.fn();
    const logger = new Logger({ info, level: Level.Info });
    logger.info('test info log!');
    expect(info).toHaveBeenCalledWith('test info log!');
  });

  test('does not log info with error level', () => {
    const info = jest.fn();
    const logger = new Logger({ info, level: Level.Error });
    logger.info('test info log!');
    expect(info).not.toHaveBeenCalled();
  });
});

describe('error', () => {
  test('logs error with default level', () => {
    const error = jest.fn();
    const logger = new Logger({ error });
    logger.error('test error log!');
    expect(error).toHaveBeenCalledWith('test error log!');
  });

  test('logs error with debug level', () => {
    const error = jest.fn();
    const logger = new Logger({ error, level: Level.Debug });
    logger.error('test error log!');
    expect(error).toHaveBeenCalledWith('test error log!');
  });

  test('logs error with info level', () => {
    const error = jest.fn();
    const logger = new Logger({ error, level: Level.Info });
    logger.error('test error log!');
    expect(error).toHaveBeenCalledWith('test error log!');
  });

  test('logs error with error level', () => {
    const error = jest.fn();
    const logger = new Logger({ error, level: Level.Error });
    logger.error('test error log!');
    expect(error).toHaveBeenCalledWith('test error log!');
  });
});

describe('debug', () => {
  test('does not log debug with default level', () => {
    const debug = jest.fn();
    const logger = new Logger({ debug });
    logger.debug('test debug log!');
    expect(debug).not.toHaveBeenCalled();
  });

  test('logs debug with debug level', () => {
    const debug = jest.fn();
    const logger = new Logger({ debug, level: Level.Debug });
    logger.debug('test debug log!');
    expect(debug).toHaveBeenCalledWith('test debug log!');
  });

  test('does not log debug with info level', () => {
    const debug = jest.fn();
    const logger = new Logger({ debug, level: Level.Info });
    logger.debug('test debug log!');
    expect(debug).not.toHaveBeenCalled();
  });

  test('does not log debug with error level', () => {
    const debug = jest.fn();
    const logger = new Logger({ debug, level: Level.Error });
    logger.debug('test debug log!');
    expect(debug).not.toHaveBeenCalled();
  });
});
