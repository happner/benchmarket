var start, original, decorate, before, after, conf, getCaller;
var config = require('./config');

/**
 * start()
 *
 * Replaces mocha's it() function with another that transparently
 * decorates each test to run encesed inside the benchmarker.
 *
 */

module.exports.start = function() {
  if (original) return;
  var original = global.it;
  global.it = function() {
    var args = Array.prototype.slice.call(arguments);
    return original.call(this, args[0], decorate(args[1]));
  }
  // global.it.skip = original.skip.apply(original,);
  global.it.only = function() {
    var args = Array.prototype.slice.call(arguments);
    return original.only.call(this, args[0], decorate(args[1]));
  }
  global.it.skip = function() {
    var args = Array.prototype.slice.call(arguments);
    return original.skip.apply(this, arguments);
  }
}


module.exports.stop = function() {
  global.it = original;
}


before = function(caller, test) {
  conf = config.load(caller);
  console.log('BEFORE', test, conf);
}

after = function(error, test) {
  if (error) {
    console.error('ERR:', error);
  }
  console.log('AFTER', test);
}

getCaller = function(skip) {
  var stack, file, parts, name, result = {};
  var origPrep = Error.prepareStackTrace;
  Error.prepareStackTrace = function(e, stack){return stack;}
  try {
    stack = Error.apply(this, arguments).stack;
    stack.shift();
    stack.shift();
    stack.shift();
    stack.shift();
    file = stack[0].getFileName();
    result = file;
  }
  finally {
    Error.prepareStackTrace = origPrep;
    return result;
  }
}

module.exports.decorate = decorate = function(testFn) {
  var match;
  var caller = getCaller();

  if (testFn) {
    if (match = testFn.toString().match(/\((.*)\)/)) {
      args = match[0].replace(/\s/, '');
      args = args.replace(/\(/, '');
      args = args.replace(/\)/, '');
      if (args.length == 0) {

        // running syncronously - no done
        return function() {
          before(caller, this.test);
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

  // running asyncronously - with done
  return function(done) {
    var altDone = function() {
      after(null, this.test);
      done();
    }

    before(caller, this.test);
    try {
      testFn.call(this, altDone);
    } catch (e) {
      after(e, this.test);
      throw e;
    }
  }
}
