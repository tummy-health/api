interface Logger {
  debug: LogFunction;
  error: LogFunction;
  info: LogFunction;
}

export type LogFunction = (input: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

export enum Level {
  Debug = 0,
  Info = 1,
  Error = 2,
}

export default Logger;
