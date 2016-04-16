
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var start, original, bench, before, after, conf, currentTest;
var config = require('./config');
var request = require('request');
var colors = require('colors');
var uuid = require('uuid');
var stats = []; // accumulate and post at the end
var accum = {};

/**
 * start()
 *
 * Replaces mocha's it() function with another that transparently
 * decorates each test to run encased inside the benchmarker.
 *
 */

module.exports.start = function() {
  if (original) return;
  var original = global.it;
  global.it = function() {
    var args = Array.prototype.slice.call(arguments);
    return original.call(this, args[0], bench(args[1]));
  }
  global.it.only = function() {
    var args = Array.prototype.slice.call(arguments);
    return original.only.call(this, args[0], bench(args[1]));
  }
  global.it.skip = function() {
    var args = Array.prototype.slice.call(arguments);
    return original.skip.apply(this, arguments);
  }

  // create a process wide ref to this "run" so that the backend
  // can allow for finding/browsing "my latest run"
  global.benchmarket = global.benchmarket || {};
  if (!global.benchmarket.run_ref) {
    global.benchmarket.run_ref = uuid.v4();
    // console.log('benchmarket run ref: %s'.green, global.benchmarket.run_ref);
  }
}


/**
 * stop()
 *
 * Terminates the benchmarker, restores the original it() function.
 *
 */

module.exports.stop = function() {
  global.it = original;
}


/**
 * store()
 *
 * Terminates the benchmarket, restores the original it() function
 * and posts the stats to the api_uri and resets.
 *
 */

module.exports.store = function(localConfig) {

  return function(done) {

    if (localConfig && localConfig.timeout) {
      this.timeout(localConfig.timeout)
    } else this.timeout(conf.timeout);

    if (stats.length === 0) {
      return done();
    }

    if (!conf.api_uri) {
      stats = [];
      return done();
    }

    if (!conf.api_key) {
      stats = [];
      return done();
    }

    request({
      method: 'POST',
      uri: conf.api_uri,
      headers: {
        'content-type': 'application/json',
        Authorization: conf.api_key
      },
      body: JSON.stringify(stats)
    }, function(err, res) {
      if (err) {
        console.error('benchmarket error:'.red, err.stack);
        stats = [];
        return done();
      }

      if (res.statusCode !== 201) {
        console.log('benchmarket error: unexpected status code %d'.red, res.statusCode);
        stats = [];
        return done();
      }

      stats = [];
      done();
    });

  }
}


/**
 * metric()
 *
 * Submit custom metric from tests.
 *
 */

module.exports.metric = function(name, value) {
  if (conf.missing.length !== 0) {
    return;
  }
  if (isNaN(parseFloat(value))) return;

  stats.push(createMessage(currentTest, [{
    name: name,
    value: value
  }]));

}


/**
 * bench()
 *
 * Decorate per test without overriding mocha's it() function
 *
 */

module.exports.bench = bench = function(testFn) {
  var match, context;

  if (typeof testFn === 'function') {
    if (match = testFn.toString().match(/\((.*)\)/)) {
      args = match[0].replace(/\s/, '');
      args = args.replace(/\(/, '');
      args = args.replace(/\)/, '');
      if (args.length == 0) {

        // return a substitute test function which calls original
        // running syncronously - no done()
        return function() {
          currentTest = this.test;
          before(this.test);
          try {
            testFn.call(this);
            after(null, this.test);
          } catch (e) {
            after(e, this.test);
            throw e;
          }
        }
      }
    }

    // return a substutute test function which calls original
    // running asyncronously - with done()
    return function(done) {
      currentTest = this.test;
      var altDone = function() {
        after(null, currentTest);
        done();
      }

      before(currentTest);
      try {
        testFn.call(this, altDone);
      } catch (e) {
        after(e, currentTest);
        throw e;
      }
    }
  }
}

/**
 * before()
 *
 * Runs just before the test (it)
 * but after any mocha befores or beforeEaches
 *
 */

before = function(test) {
  conf = config.load(test.file);
  if (conf.missing.length !== 0) {
    return;
  }

  accum.timeStart = Date.now();

  var memUsage = process.memoryUsage();
  // accum.heapTotalStart = memUsage.heapTotal;
  accum.heapUsedStart = memUsage.heapUsed;

}

/**
 * after()
 *
 * Runs just after the test (it)
 * but after any mocha befores or beforeEaches
 *
 * NOTE: does not run if the test times out...
 *
 */

after = function(error, test) {
  if (conf.missing.length !== 0) {
    return;
  }

  var duration = Date.now() - accum.timeStart;
  var memUsage = process.memoryUsage();
  var heapUsedDelta = memUsage.heapUsed - accum.heapUsedStart;

  stats.push(createMessage(test, [
    {
      name: 'duration',
      value: duration
    },
    {
      name: 'heapUdelta',
      value: heapUsedDelta
    },
  ]));
}

var createMessage = function(test, samplesArray) {

  var testfile = test.file.substr(conf.dirname.length + 1);

  // ?? handle windows ???
  if (process.platform === 'win32') {
    testfile = testfile.replace(/\\/g, '/');
  }


  return {
    ref: global.benchmarket.run_ref,
    repo: conf.repo,
    file: testfile,
    test: getFullTitle(test),
    ts: new Date(),
    samples: samplesArray
  }
}


var getFullTitle = function(test, assemble) {
  if (!test.parent) return assemble;
  if (!assemble) assemble = test.title
  else assemble = test.title + '/' + assemble;
  return getFullTitle(test.parent, assemble);
}


