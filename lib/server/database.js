var databaseConfig = require('../../database')[process.env.NODE_ENV];
var pg = require('pg');
var conString = 'postgres://';

if (databaseConfig.user) {
  conString += databaseConfig.user +':' + databaseConfig.password + '@'
}
conString += (databaseConfig.server || 'localhost') + '/' + databaseConfig.database;


/*
  - optionally accepts {res} to reply 500 on database connect error
  - if {res} is present and database connect failes then 500 is
    sent and no callback is made
  - if {res} is present no err is passed in callback (on database connect success)
*/
module.exports = function(res, callback) {
  if (typeof callback !== 'function') {
    return pg.connect(conString, callback = res);
  }

  pg.connect(conString, function(err, conn, done) {
    if (err) {
      ////////////////////////////// console.error(err.stack); // could fill disk real fast if >> log file
      res.statusCode = 500;
      return res.send(err.stack);
    }

    callback(conn, done);
  });
}
