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
    `INSERT INTO properties (title,numberOfBeds,address,geoLocationLat,geoLocationLong,description,typeId,countryId)
    VALUES ('property 1',2,'address 1',30.456,-5.79,'this is property 1',1,1),
    ('property 2',3,'address 2',10.2,1.2,null,2,2)`
  ));
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
