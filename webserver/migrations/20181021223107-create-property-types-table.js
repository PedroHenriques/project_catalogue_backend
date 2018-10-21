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
    `CREATE TABLE IF NOT EXISTS propertyTypes
    (
      id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
      name VARCHAR(100) NOT NULL
    ) ENGINE=InnoDB`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `DROP TABLE IF EXISTS propertyTypes`
  ));
};

exports._meta = {
  "version": 1
};
