'use strict';
import { createConnection, Connection } from 'mysql';

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