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
    `INSERT INTO countries (name) VALUES ('Portugal'), ('United Kingdom')`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `DELETE FROM countries WHERE name = 'Portugal' OR name = 'United Kingdom'`
  ));
};

exports._meta = {
  "version": 1
};
