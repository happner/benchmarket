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

    db.all.bind(db, 'CREATE TABLE filenames (' +
      'id SERIAL,' +
      'repositories_id INTEGER,' +
      'created_at TIMESTAMP WITHOUT TIME ZONE,' +
      'name TEXT,' +
      'last_run_global TEXT,' +
      'last_run_at TIMESTAMP WITHOUT TIME ZONE' +
    ')'),

    db.addIndex.bind(db, 'filenames', 'filenames_repositories_id_index', ['repositories_id'], false),
    db.addIndex.bind(db, 'filenames', 'filenames_id_repositories_id_index_uniq', ['id', 'repositories_id'], true),
    db.addIndex.bind(db, 'filenames', 'filenames_created_at_index', ['created_at'], false),
    db.addIndex.bind(db, 'filenames', 'filenames_name_index', ['name'], false),
    db.addIndex.bind(db, 'filenames', 'filenames_last_run_global_index', ['last_run_global'], false),
    db.addIndex.bind(db, 'filenames', 'filenames_last_run_at_index', ['last_run_at'], false),

  ], callback);
};

exports.down = function(db, callback) {
  db.dropTable('filenames', callback);
};
