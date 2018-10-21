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
    `CREATE TABLE IF NOT EXISTS usersProperties
    (
      userId INT UNSIGNED NOT NULL,
      propertyId INT UNSIGNED NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT NOW(),
      updatedAt DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
      PRIMARY KEY (userId, propertyId)
    ) ENGINE=InnoDB`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `DROP TABLE IF EXISTS usersProperties`
  ));
};

exports._meta = {
  "version": 1
};
