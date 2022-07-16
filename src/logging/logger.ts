import ILogger, { Level, LogFunction } from '@src/logging/loggerType';

class Logger implements ILogger {
  readonly level: Level;

  readonly logDebug: LogFunction;

  readonly logError: LogFunction;

  readonly logInfo: LogFunction;

  constructor({
    debug = console.debug,
    error = console.error,
    info = console.log,
    level = Level.Info,
  }: {
    debug?: LogFunction;
    error?: LogFunction;
    info?: LogFunction;
    level?: Level;
  } = {}) {
    this.level = level;
    this.logDebug = debug;
    this.logError = error;
    this.logInfo = info;
  }

  debug = (input) => {
    if (this.level > Level.Debug) return;
    this.logDebug(input);
  };

  error = (input) => {
    this.logError(input);
  };

  info = (input) => {
    if (this.level > Level.Info) return;
    this.logInfo(input);
  };
}

export default Logger;
