'use strict';
import { join } from 'path';
import {
  createLogger, Logger as WinstonLogger, LoggerOptions, transports, format
} from 'winston';
import { IMessage, ILogMessage } from '../interfaces/services';

class Logger {
  private logger: WinstonLogger;

  constructor(setup?: LoggerOptions) {
    this.logger = createLogger(setup);
  }

  public log = (args: ILogMessage): void => {
    this.logger.log(args);
  }

  public error = (args: IMessage): void => {
    this.log({ level: 'error', ...args });
  }

  public warn = (args: IMessage): void => {
    this.log({ level: 'warn', ...args });
  }

  public info = (args: IMessage): void => {
    this.log({ level: 'info', ...args });
  }

  public debug = (args: IMessage): void => {
    this.log({ level: 'debug', ...args });
  }
}

const transportInstances = {
  console: new transports.Console({
    stderrLevels: [ 'error' ],
    format: format.combine(
      format.timestamp(),
      format.colorize(),
      format.simple()
    ),
  }),
  errorFile: new transports.File({
    level: 'error',
    filename: join('.', 'logs', 'server_errors.log'),
  }),
  exceptionFile: new transports.File({
    filename: join('.', 'logs', 'exceptions.log'),
  }),
};

const loggerOptions: LoggerOptions = {
  level: (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transports: [ transportInstances.console, transportInstances.errorFile ],
  exceptionHandlers: [ transportInstances.exceptionFile ],
  format: format.combine(
    format.timestamp(),
    format.simple()
  ),
  exitOnError: false,
};
const appLogger = new Logger(loggerOptions);

export default appLogger;