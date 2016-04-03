var defaults = {
  timeout: 6000,
}
var required = ['api_key', 'api_uri', 'repo', 'dirname'];
var config = {
  missing: [],
};
var fs = require('fs');
var path = require('path');
var currentPath;
var colors = require('colors');

var recurse = function(fpath) {
  try {
    var next = require(fpath + path.sep + '.benchmarket.js');
    Object.keys(next).forEach(function(key) {
      if (!config[key]) config[key] = next[key];
    });
  } catch (e) {
  } finally {
    if (fpath.length > 6) {
      fpath = path.dirname(fpath);
      recurse(fpath);
    }
  }
}

// var findPackageDirAndRepoName = function() {
//   // walk up dir tree (limit 4) in search of package.json
//   try {
//     require HATE WINDOWS
//   }
// }

module.exports.load = function(caller) {
  if (caller === currentPath) {
    // new test, same testfile, same config
    return config;
  }
  // new test, different testfile, different config
  config = {
    missing: [],
  }
  currentPath = caller;
  recurse(path.dirname(caller));

  Object.keys(defaults).forEach(function(key) {
    if (typeof config[key] === 'undefined') {
      config[key] = defaults[key];
    }
  });

  required.forEach(function(key) {
    if (typeof config[key] === 'undefined' || typeof config[key] == null) {
      config.missing.push(key);
    }
  });

  if (config.missing.length > 0) {
    console.error('benchmarket error: missing configs %j'.red, config.missing);
  }

  return config;
}
