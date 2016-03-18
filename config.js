var defaults = {
  mem: true,
  mem_interval: 5000,
}
var config = {};
var fs = require('fs');
var path = require('path');
var currentPath;

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

module.exports.load = function(caller) {
  if (caller === currentPath) {
    console.log('RETURN EXISTING');
    return config;
  }
  console.log('RETURN NEW');
  currentPath = caller;
  recurse(path.dirname(caller));
  Object.keys(defaults).forEach(function(key) {
    if (typeof config[key] === 'undefined') {
      config[key] = defaults[key];
    }
  });

  return config;
}