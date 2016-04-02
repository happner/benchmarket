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

    db.all.bind(db, 'CREATE TABLE metrics (' +
      'id BIGSERIAL,' +
      'created_at TIMESTAMP WITHOUT TIME ZONE,' +
      'name TEXT,' +
      'value TEXT,' +
      'tests_id BIGINT,' +
      'runs_id BIGINT' +
    ')'),

    db.addIndex.bind(db, 'metrics', 'metrics_created_at_index', ['created_at'], false),
    db.addIndex.bind(db, 'metrics', 'metrics_name_index_uniq', ['name'], false),
    db.addIndex.bind(db, 'metrics', 'metrics_tests_id_index', ['tests_id'], false),
    db.addIndex.bind(db, 'metrics', 'metrics_runs_id_index', ['runs_id'], false),

  ], callback);
};

exports.down = function(db, callback) {
  db.dropTable('metrics', callback);
};
