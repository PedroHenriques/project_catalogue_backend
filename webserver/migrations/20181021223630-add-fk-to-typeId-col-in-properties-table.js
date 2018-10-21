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
    ADD CONSTRAINT FOREIGN KEY fk_properties_typeId (typeId) REFERENCES propertyTypes(id) ON DELETE CASCADE ON UPDATE CASCADE`
  ));
};

exports.down = function(db) {
  return(db.runSql(
    `ALTER TABLE properties
    DROP FOREIGN KEY IF EXISTS fk_properties_typeId`
  ));
};

exports._meta = {
  "version": 1
};
