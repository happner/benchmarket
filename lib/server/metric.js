var Promise = require('bluebird');

module.exports.store = function(params) {
  var user = params.user;
  var conn = params.conn;
  return function(metric) {

    // console.log(metric);
    /*
    {
      repo: 'happn',
      file: 'test/test-benchmark/9_permissions_cache_benchmarks.js',
      test: '9_permissions_cache_benchmark/aa/gg',
      ts: '2016-03-29T12:11:23.451Z',
      samples: [{
        name: 'duration',
        value: 1004
      }]
    }
    */

    var runsRow, repoRow, testfileRow, testRow;

    return Promise.resolve() ////////////// TODO, transaction

    .then(function() {
      return module.exports.updateRepository(user, conn, metric)
    })

    .then(function(repo) {

      repoRow = repo;
      return module.exports.updateRun(user, conn, metric, repoRow);
    })

    .then(function(run) {
      runsRow = run;
      return module.exports.updateTestfile(user, conn, metric, repoRow, runsRow);
    })

    .then(function(testfile) {
      testfileRow = testfile;
      return module.exports.updateTest(user, conn, metric, repoRow, runsRow, testfileRow);
    })

    .then(function(test) {
      testRow = test;
      return module.exports.updateMetrics(user, conn, metric, repoRow, runsRow, testfileRow, testRow);
    })

  }
}


module.exports.updateRepository = function(user, conn, metric) {
  return new Promise(function(resolve, reject) {
                                             // missing WHERE organisation...
    conn.query('SELECT id FROM repositories WHERE name = $1',
      [metric.repo],
      function(err, repoResult) {
      if (err) return reject(err);

      if (repoResult.rows.length === 0) {
        return conn.query('INSERT INTO repositories (created_at, name, last_run_at) VALUES ($1, $2, $3)',
          [(new Date()).toISOString(), metric.repo, metric.ts],
          function(err, result) {
            if (err) return reject(err);

            conn.query('SELECT id FROM repositories WHERE name = $1',
              [metric.repo],
              function(err, result) {
                if (err) return reject(err);
                resolve(result.rows[0]);
              });
          });
      }

      return conn.query('UPDATE repositories SET last_run_at = $1 WHERE id = $2',
        [metric.ts, repoResult.rows[0].id],
        function(err, result) {
           if (err) return reject(err);
           resolve(repoResult.rows[0]);
        });
    });
  });
}


module.exports.updateRun = function(user, conn, metric, repoRow) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT id FROM runs WHERE run_ref = $1',
    [metric.ref],
    function(err, runResult) {
      if (err) return reject(err);

      if (runResult.rows.length === 0) {
        return conn.query('INSERT INTO runs (created_at, run_ref, users_id, repositories_id) VALUES ($1, $2, $3, $4)',
        [metric.ts, metric.ref, user.id, repoRow.id],
        function(err, result) {
          if (err) return reject(err);

          conn.query('SELECT id FROM runs WHERE run_ref = $1',
          [metric.ref],
          function(err, result) {
            if (err) return reject(err);
            resolve(result.rows[0]);
          });
        });
      }

      resolve(runResult.rows[0]);
    });
  });
}


module.exports.updateTestfile = function(user, conn, metric, repoRow, runsRow) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT id FROM testfiles WHERE repositories_id = $1 AND name = $2',
      [repoRow.id, metric.file],
      function(err, testrowResult) {
        if (err) return reject(err);

        if (testrowResult.rows.length === 0) {
          return conn.query('INSERT INTO testfiles (repositories_id, created_at, name, last_run_at) VALUES ($1, $2, $3, $4)',
            [repoRow.id, (new Date()).toISOString(), metric.file, metric.ts],
            function(err, result) {
              if (err) return reject(err);

              conn.query('SELECT id FROM testfiles WHERE repositories_id = $1 AND name = $2',
                [repoRow.id, metric.file],
                function(err, result) {
                  if (err) return reject(err);
                  resolve(result.rows[0])

                });
            });
        }

        return conn.query('UPDATE testfiles SET last_run_at = $1 WHERE id = $2',
          [metric.ts, testrowResult.rows[0].id],
          function(err, result) {
            if (err) return reject(err);
            resolve(testrowResult.rows[0]);
          });
      });
  });
}

module.exports.updateTest = function(user, conn, metric, repoRow, runsRow, testfileRow) {
  return new Promise(function(resolve, reject) {
    conn.query('SELECT id FROM tests WHERE testfiles_id = $1 AND name = $2',
      [testfileRow.id, metric.test],
      function(err, testResult) {
        if (err) return reject(err);

        if (testResult.rows.length === 0) {
          return conn.query('INSERT INTO tests (testfiles_id, created_at, name, last_run_at) VALUES ($1, $2, $3, $4)',
            [testfileRow.id, (new Date()).toISOString(), metric.test, metric.ts],
            function(err, result) {
              if (err) return reject(err);

              conn.query('SELECT id FROM tests WHERE testfiles_id = $1 AND name = $2',
                [testfileRow.id, metric.test],
                function(err, result) {
                  if (err) return reject(err);
                  resolve(result.rows[0])

                });
            });
        }

        return conn.query('UPDATE tests SET last_run_at = $1 WHERE id = $2',
          [metric.ts, testResult.rows[0].id],
          function(err, result) {
            if (err) return reject(err);
            resolve(testResult.rows[0]);
          });
      });
  });
}

module.exports.updateMetrics = function(user, conn, metric, repoRow, runsRow, testfileRow, testRow) {
  return Promise.resolve(metric.samples).map(
    module.exports.updateMetric(conn, metric, runsRow, testRow),
    {concurrency: 1}
  )
}

module.exports.updateMetric = function(conn, metric, runsRow, testRow) {
  return function(sample) {
    return new Promise(function(resolve, reject) {
      conn.query('INSERT INTO metrics (created_at, name, value, tests_id, runs_id) VALUES ($1, $2, $3, $4, $5)',
      [metric.ts, sample.name, sample.value.toString(), testRow.id, runsRow.id],
      function(err, result) {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}


