'use strict';
import { createConnection, Connection } from 'mysql';
import logger from '../services/Logger';

interface IQuery {
  statement: string,
  bindValues?: (string | number | boolean | Date)[],
}

interface IRunSingleQueryArgs {
  query: IQuery
  closeConnection: boolean,
}

export function runSingleQuery(args: IRunSingleQueryArgs): Promise<any> {
  return(
    connect()
    .then((connection) => new Promise(async (resolve, reject) => {
      try {
        resolve(await query(connection, args.query));
      } catch (error) {
        logger.error({
          message: error.message,
          payload: error,
        });

        reject(error);
      } finally {
        connection.end();
      }
    }))
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

function query(connection: Connection, queryData: IQuery): Promise<any> {
  return(new Promise((resolve, reject) => {
    connection.query(
      queryData.statement,
      queryData.bindValues,
      (error, results, fields) => {
        if (error) { return(reject(error)); }
        return(resolve(results));
      }
    );
  }));
}