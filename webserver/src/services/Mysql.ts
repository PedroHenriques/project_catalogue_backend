'use strict';
import { createConnection, Connection } from 'mysql';
import logger from '../services/Logger';

interface IQuery {
  statement: string,
  bindValues?: (string | number | boolean | Date)[],
}

interface IRunQueryArgs {
  query: IQuery
  closeConnection: boolean,
}

export function runQuery(args: IQuery): Promise<any> {
  return(
    connect()
    .then(async (connection) => new Promise((resolve, reject) => {
      connection.query(
        args.statement,
        args.bindValues,
        (error, results, fields) => {
          connection.end();
          if (error) { return(reject(error)); }
          return(resolve(results));
        }
      );
    }))
    .then(result => result)
    .catch(error => {
      logger.error({
        message: error.message,
        payload: error,
      });

      return([]);
    })
  );
}

function connect(): Promise<Connection> {
  return(new Promise((resolve, reject) => {
    const conObject = createConnection({
      host: process.env.MARIADB_HOST || 'localhost',
      port: parseInt(process.env.MARIADB_PORT || '3306', 10),
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASSWORD,
      database: process.env.MARIADB_DATABASE,
    });

    conObject.connect(error => {
      if (error) {
        return(reject(error));
      }
      return(resolve(conObject));
    });
  }));
}