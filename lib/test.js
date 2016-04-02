#!/usr/bin/env node

require('dotenv').config();

var database = require('./server/database');

database({}, function(client, done) {
  client.query('select * from metrics order by created_at desc limit 1', function(err, result) {
    done();
    console.log(result.rows);
  });
});
