var defaults = {
  timeout: 6000,
  requireGC: true,
}
var required = ['api_key', 'api_uri', 'repo', 'branch', 'dirname', 'host'];
var config = {
  missing: [],
};
var fs = require('fs');
var path = require('path');
var currentPath;
var colors = require('colors');
var ini = require('ini');
var os = require('os');

var loggedMissingConfig = false;

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

  var repoHome, gitDetails, repoName;

  // new test, different testfile, different config
  // recursively load config from .benchmarket.js files
  config = {
    missing: [],
  }
  currentPath = caller;
  recurse(path.dirname(caller));

  repoHome = module.exports.findRepoHome(path.dirname(caller));

  if (repoHome) {

    if (!config.dirname) {
      config.dirname = repoHome;
    }

    gitDetails = module.exports.loadGitDetails(repoHome);

    if (!config.repo) {
      try {
        repoName = gitDetails.config['remote "origin"'].url;
        // git@github.com:happner/benchmarket.git
        repoName = repoName.replace(/^git.*:/, '');
        // https://github.com/happner/benchmarket.git
        repoName = repoName.replace(/^https.*\.com\//, '');
        repoName = repoName.replace(/\.git$/, '');
        config.repo = repoName;
      } catch (e) {}
    }

    try {
      config.branch = gitDetails.branch || 'undefined';
    } catch (e) {
      config.branch = 'undefined';
    }
  }

  if (!config.host) {
    config.host = os.hostname();
  }

  Object.keys(defaults).forEach(function(key) {
    if (typeof config[key] === 'undefined') {
      config[key] = defaults[key];
    }
  });

  // env vars override
  if (typeof process.env.BENCHMARKET_API_KEY !== 'undefined') {
    config.api_key = process.env.BENCHMARKET_API_KEY;
  }
  if (typeof process.env.BENCHMARKET_API_URI !== 'undefined') {
    config.api_uri = process.env.BENCHMARKET_API_URI;
  }
  if (typeof process.env.BENCHMARKET_HOST !== 'undefined') {
    config.host = process.env.BENCHMARKET_HOST;
  }
  if (typeof process.env.BENCHMARKET_REQUIRE_GC !== 'undefined') {
    config.requireGC = (
      process.env.BENCHMARKET_REQUIRE_GC === 'true' ||
      process.env.BENCHMARKET_REQUIRE_GC === '1'
    );
  }

  required.forEach(function(key) {
    if (typeof config[key] === 'undefined' || typeof config[key] == null) {
      config.missing.push(key);
    }
  });

  if (config.missing.length > 0) {
    if (!loggedMissingConfig) {
      console.error('benchmarket error: missing configs %j'.red, config.missing);
      loggedMissingConfig = true;
    }
  }

  return config;
}

module.exports.findRepoHome = function(fpath) {
  var files, next;
  try {
    files = fs.readdirSync(fpath);
  } catch (e) {
    console.error('error finding repo home', e);
    return false;
  }
  if (files.indexOf('.git') >= 0) return fpath;
  next = path.dirname(fpath);
  if (next === fpath) return false; // hit root directory
  return module.exports.findRepoHome(path.dirname(fpath));
}


module.exports.loadGitDetails = function(repoHome) {
  var configText, config, headText, array, branch;
  try {
    configText = fs.readFileSync(repoHome + path.sep + '.git' + path.sep + 'config').toString();
    config = ini.parse(configText);
    headText = fs.readFileSync(repoHome + path.sep + '.git' + path.sep + 'HEAD').toString();
    array = headText.split('/');
    array.shift();
    array.shift();
    branch = array.join('/').trim();
  } catch (e) {
    console.error('error loading git config', e);
    return false;
  }

  return {
    config: config,
    branch: branch
  }
}

