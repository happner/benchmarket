var start, original, bench, before, after, conf;
var config = require('./config');
var memory = require('./memory');
var request = require('request');
var stats = []; // accumulate and post at the end (NOT USING THIS)

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
}


/**
 * stop()
 *
 * Terminates the benchmarker, restores the original it() function
 * and posts the stats to the api_uri and resets.
 *
 */

module.exports.stop = function(done) {

  global.it = original;
  if (config.mem) memory.stop(stats, config);





  stats = [];

  done();

}


/**
 * bench()
 *
 * Decorate per test without overriding mocha's it() function
 *
 */

module.exports.bench = bench = function(testFn) {
  var match, context;

  if (testFn) {
    if (match = testFn.toString().match(/\((.*)\)/)) {
      args = match[0].replace(/\s/, '');
      args = args.replace(/\(/, '');
      args = args.replace(/\)/, '');
      if (args.length == 0) {

        // return a substutute test function which calls original
        // running syncronously - no done
        return function() {
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
  }

  // return a substutute test function which calls original
  // running asyncronously - with done
  return function(done) {
    var test = this.test;
    var altDone = function() {
      after(null, test);
      done();
    }

    before(test);
    try {
      testFn.call(this, altDone);
    } catch (e) {
      after(e, test);
      throw e;
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
  if (conf.mem) memory.start(stats, conf, test);
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
  if (conf.mem) memory.stop(stats, conf, test);
  if (error) {
    console.error('benchmarket error:', error);
  }
}


