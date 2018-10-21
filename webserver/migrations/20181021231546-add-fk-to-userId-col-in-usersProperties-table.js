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
    `ALTER TABLE usersProperties
    ADD CONSTRAINT FOREIGN KEY fk_usersProperties_userId (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `ALTER TABLE usersProperties
    DROP FOREIGN KEY IF EXISTS fk_usersProperties_userId`
  ));
};

exports._meta = {
  "version": 1
};
