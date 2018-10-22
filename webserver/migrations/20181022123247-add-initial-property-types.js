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
    `INSERT INTO propertyTypes (name) VALUES ('villa'), ('house'), ('apartment')`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `DELETE FROM propertyTypes WHERE name = 'villa' OR name = 'house' OR
    name = 'apartment'`
  ));
};

exports._meta = {
  "version": 1
};
