'use strict';

var dbm;
var type;
var seed;
var async = require('async');

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {

  async.series([

    db.all.bind(db, 'CREATE TABLE users (' +
      'id SERIAL,' +
      'name TEXT,' +
      'password TEXT,' +
      'api_key TEXT' +
    ')'),

    db.addIndex.bind(db, 'tests', 'tests_name_index_uniq', ['name'], true)

  ], callback);
};

exports.down = function(db, callback) {
  db.dropTable('tests', callback);
};
