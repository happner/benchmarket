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

    db.all.bind(db, 'CREATE TABLE runs (' +
      'id SERIAL,' +
      'run_ref TEXT,' +
      'users_id INTEGER,' +
      'repositories_id INTEGER,' +
      'created_at TIMESTAMP WITH TIME ZONE' +
    ')'),

    db.addIndex.bind(db, 'runs', 'runs_run_ref_index_uniq', ['run_ref'], true),
    db.addIndex.bind(db, 'runs', 'runs_users_id_index', ['users_id'], false),
    db.addIndex.bind(db, 'runs', 'runs_repositories_id_index', ['repositories_id'], false),

  ], callback);
};

exports.down = function(db, callback) {
  db.dropTable('runs', callback);
};
