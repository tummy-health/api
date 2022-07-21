import ILogger, { Level } from '@src/logging/loggerType';

class TestLogger implements ILogger {
  readonly level: Level;

  readonly logs: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  constructor({ level = Level.Info }: { level?: Level } = {}) {
    this.level = level;
  }

  debug = (input) => {
    if (this.level > Level.Debug) return;
    this.logs.push(input);
  };

  error = (input) => {
    this.logs.push(input);
  };

  info = (input) => {
    if (this.level > Level.Info) return;
    this.logs.push(input);
  };
}

export default TestLogger;
