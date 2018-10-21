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
    `CREATE TABLE IF NOT EXISTS properties
    (
      id INT UNSIGNED AUTO_INCREMENT NOT NULL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      numberOfBeds TINYINT(10) UNSIGNED NOT NULL,
      address VARCHAR(255) NOT NULL,
      geoLocation FLOAT(10,6) NOT NULL,
      description VARCHAR(255) NULL
    ) ENGINE=InnoDB`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `DROP TABLE IF EXISTS properties`
  ));
};

exports._meta = {
  "version": 1
};
