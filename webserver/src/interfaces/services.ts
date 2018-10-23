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

export interface IMailerSendArgs {
  from: {
    name: string,
    address: string,
  },
  to: string,
  subject: string,
  body: {
    plain: string,
    html: string,
    keywordReplacements: IEmailBodyReplacement[],
  },
}

export interface IEmailBodyReplacement {
  find: string,
  replace: string,
}