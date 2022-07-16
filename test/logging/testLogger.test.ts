import Logger from '@src/logging/testLogger';
import { Level } from '@src/logging/loggerType';

describe('info', () => {
  test('logs info with default level', () => {
    const logger = new Logger();
    logger.info('test info log!');
    expect(logger.logs[0]).toBe('test info log!');
  });

  test('logs info with debug level', () => {
    const logger = new Logger({ level: Level.Debug });
    logger.info('test info log!');
    expect(logger.logs[0]).toBe('test info log!');
  });

  test('logs info with info level', () => {
    const logger = new Logger({ level: Level.Info });
    logger.info('test info log!');
    expect(logger.logs[0]).toBe('test info log!');
  });

  test('does not log info with error level', () => {
    const logger = new Logger({ level: Level.Error });
    logger.info('test info log!');
    expect(logger.logs).toHaveLength(0);
  });
});

describe('error', () => {
  test('logs error with default level', () => {
    const logger = new Logger();
    logger.error('test error log!');
    expect(logger.logs[0]).toBe('test error log!');
  });

  test('logs error with debug level', () => {
    const logger = new Logger({ level: Level.Debug });
    logger.error('test error log!');
    expect(logger.logs[0]).toBe('test error log!');
  });

  test('logs error with info level', () => {
    const logger = new Logger({ level: Level.Info });
    logger.error('test error log!');
    expect(logger.logs[0]).toBe('test error log!');
  });

  test('logs error with error level', () => {
    const logger = new Logger({ level: Level.Error });
    logger.error('test error log!');
    expect(logger.logs[0]).toBe('test error log!');
  });
});

describe('debug', () => {
  test('does not log debug with default level', () => {
    const logger = new Logger();
    logger.debug('test debug log!');
    expect(logger.logs).toHaveLength(0);
  });

  test('logs debug with debug level', () => {
    const logger = new Logger({ level: Level.Debug });
    logger.debug('test debug log!');
    expect(logger.logs[0]).toBe('test debug log!');
  });

  test('does not log debug with info level', () => {
    const logger = new Logger({ level: Level.Info });
    logger.debug('test debug log!');
    expect(logger.logs).toHaveLength(0);
  });

  test('does not log debug with error level', () => {
    const logger = new Logger({ level: Level.Error });
    logger.debug('test debug log!');
    expect(logger.logs).toHaveLength(0);
  });
});
