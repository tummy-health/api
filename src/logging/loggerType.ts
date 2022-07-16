interface Logger {
  debug: LogFunction;
  error: LogFunction;
  info: LogFunction;
}

export type LogFunction = (input: any) => void;

export enum Level {
  Debug = 0,
  Info = 1,
  Error = 2,
}

export default Logger;
