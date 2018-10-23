'use strict';

export interface IMessage {
  message: string,
  payload?: any,
}

export interface ILogMessage extends IMessage {
  level: 'error' | 'warn' | 'info' | 'debug',
}

export interface IFilesToWatch {
  [key: string]: {
    path: string,
    lastModified: number,
    persistKey: string,
  }
}