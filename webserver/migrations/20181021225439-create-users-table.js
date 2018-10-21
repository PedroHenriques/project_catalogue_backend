'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return(db.runSql(
    `CREATE TABLE IF NOT EXISTS users
    (
      id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `DROP TABLE IF EXISTS users`
  ));
};

exports._meta = {
  "version": 1
};
