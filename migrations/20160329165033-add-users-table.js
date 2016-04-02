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
      'id BIGSERIAL,' +
      'username TEXT,' +
      'password TEXT,' +
      'api_key TEXT' +
    ')'),

    db.addIndex.bind(db, 'users', 'users_username_index_uniq', ['username'], true),
    db.addIndex.bind(db, 'users', 'users_api_key_index_uniq', ['api_key'], true)

  ], callback);
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};
