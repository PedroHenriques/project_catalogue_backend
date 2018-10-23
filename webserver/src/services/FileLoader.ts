'use strict';
import {
  getFileStats, parseJsonFile
} from '../services/fileHandlers';
import logger from '../services/Logger';
import cache from '../services/Cache';
import { IFilesToWatch } from '../interfaces/services';

interface IFileLoaderArgs {
  filesToWatch: IFilesToWatch,
}

interface IFileTypeHandlers {
  [key: string]: (filePath: string) => Promise<any> | PromiseLike<any>,
}

export default class FileLoader {
  private intervalId: NodeJS.Timer;
  private filesToWatch: IFilesToWatch;
  private fileTypeHandlers: IFileTypeHandlers = {
    json: parseJsonFile,
  };

  constructor(args: IFileLoaderArgs) {
    this.filesToWatch = args.filesToWatch;

    this.regularFileCheckup();

    this.intervalId = global.setInterval(
      this.regularFileCheckup,
      5 * 60 * 60 * 1000
    );
  }

  public endCheckUp = (): void => {
    global.clearInterval(this.intervalId);
  }

  private regularFileCheckup = (): void => {
    logger.debug({ message: 'Starting file checkup' });

    Object.getOwnPropertyNames(this.filesToWatch).forEach(key => {
      getFileStats(this.filesToWatch[key].path)
      .then(stats => {
        const fileModTime = stats.mtimeMs;
        if (fileModTime <= this.filesToWatch[key].lastModified) {
          return;
        }

        logger.debug({
          message: `File ${this.filesToWatch[key].path} change detected.`
        });

        const reMatches = this.filesToWatch[key].path.match(/\.([^.]+)$/i);
        if (reMatches === null) {
          throw new Error(
            `The file type for "${this.filesToWatch[key].path}" ` +
            'could not be determined.'
          );
        }

        const fileType = reMatches[1];
        if (this.fileTypeHandlers[fileType] === undefined) {
          throw new Error(
            `The file type "${fileType}" is not an expected file type.`
          );
        }

        this.filesToWatch[key].lastModified = fileModTime;

        return(this.fileTypeHandlers[fileType](this.filesToWatch[key].path));
      })
      .then(fileContent => {
        if (fileContent === undefined) { return(Promise.resolve(null)); }

        return(
          cache.setObject(
            this.filesToWatch[key].persistKey,
            fileContent
          )
        );
      })
      .then(success => {
        if (success === null) { return; }

        if (!success) {
          throw new Error(
            'Failed to persist the contents of the file ' +
            `"${this.filesToWatch[key].path}" to the key ` +
            `"${this.filesToWatch[key].persistKey}"`
          );
        }

        logger.debug({
          message: `File ${this.filesToWatch[key].path} handled.`
        });
      })
      .catch(error => {
        logger.error({
          message: error.message,
          payload: error,
        });
      });
    });
  }
}