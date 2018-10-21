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
    `ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS (typeId INT UNSIGNED NOT NULL)`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `ALTER TABLE properties
    DROP COLUMN IF EXISTS typeId`
  ));
};

exports._meta = {
  "version": 1
};
