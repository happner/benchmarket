var database = require('./database');

/*
  authenticated decorator,
  returns faux middleware and which then operates the
  real middleware with additional funcionalities including

  - failing if unauthorised
  - passing conn (the database connection)
  - passin done (release conn back to pool)

  result:

  ```js
    app.get('/repos', authenticated( function(req, res, user, conn, done) {
      // - only runs this body if auth succeeds
      // - auth done in background
      // - 401 and 500 on auth and database actions are sent in background
      //   where appropriate (without disturbing this function)
      // - user, is the authorised user {id}
      // - conn, is a live connection to the database
      // - done. !!MUST BE CALLED!! to release the conn back to pool
    } ));
  ```
*/

module.exports = function(originalMiddlewareFn) {

  return function(req, res) { // return decorated middleware

    // console.log(req.url, req.headers);

    if (typeof req.headers.authorization === 'undefined') {
      res.statusCode = 401;
      return res.end();
    }

    database(res, function(conn, done) {

      conn.query('SELECT id FROM users WHERE api_key = $1',
      [req.headers.authorization],
      function(err, result) {
        var user = result.rows[0];

        if (err) {
          console.error('error running query', err.stack);
          res.statusCode = 500;
          res.send(err.stack);
          return done();
        }

        if (result.rows.length !== 1) {
          res.statusCode = 401;
          res.send();
          return done();
        }

        originalMiddlewareFn(req, res, user, conn, done);

      });
    });
  }
}
