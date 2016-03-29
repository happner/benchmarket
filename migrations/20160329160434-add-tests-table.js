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

    db.all.bind(db, 'CREATE TABLE tests (' +
      'id SERIAL,' +
      'testfiles_id INTEGER,' +
      'created_at TIMESTAMP WITHOUT TIME ZONE,' +
      'name TEXT,' +
      'last_run_global TEXT,' +
      'last_run_at TIMESTAMP WITHOUT TIME ZONE' +
    ')'),

    db.addIndex.bind(db, 'tests', 'tests_testfiles_id_index', ['testfiles_id'], false),
    db.addIndex.bind(db, 'tests', 'tests_id_testfiles_id_index_uniq', ['id', 'testfiles_id'], true),
    db.addIndex.bind(db, 'tests', 'tests_created_at_index', ['created_at'], false),
    db.addIndex.bind(db, 'tests', 'tests_name_index', ['name'], false),
    db.addIndex.bind(db, 'tests', 'tests_last_run_global_index', ['last_run_global'], false),
    db.addIndex.bind(db, 'tests', 'tests_last_run_at_index', ['last_run_at'], false),

  ], callback);
};

exports.down = function(db, callback) {
  db.dropTable('tests', callback);
};
