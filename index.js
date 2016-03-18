var start, original, bench, before, after, conf;
var config = require('./config');

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
 * Terminates the benchmarker and restore the original it function
 *
 */

module.exports.stop = function() {
  global.it = original;
}

/**
 * decorate()
 *
 * Decorate per test without overriding mocha's it function
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
 * but after any mocha befores or beforeAlls
 *
 */

before = function(test) {
  conf = config.load(test.file);
  console.log('BEFORE', test, conf);
}

/**
 * after()
 *
 * Runs just after the test (it)
 * but after any mocha befores or beforeAlls
 *
 * NOTE: does not run if the test times out...
 *
 */

after = function(error, test) {
  if (error) {
    console.error('ERR:', error);
  }
  console.log('AFTER', test);
}

