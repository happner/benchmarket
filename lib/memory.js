// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// var request = require('request');
var os
var running = false;
var stats, conf, test;

var getFullTitle = function(test, assemble) {
  if (!test.parent) return assemble;
  if (!assemble) assemble = test.title
  else assemble = test.title + '/' + assemble;
  return getFullTitle(test.parent, assemble);
}

var postSample = function() {
  console.log('POST SAMPLE', test.title);
  var fullTitle = getFullTitle(test);
  var title = test.title;
  var file = test.file.substr(process.cwd().length + 1);
  var sample = process.memoryUsage();
  var msg = {
    repo: conf.repo,
    file: file,
    test: fullTitle,
    sample: {
      type: 'mem',
      ts: new Date(),
      value: {
        rss: sample.rss,
        heapTotal: sample.heapTotal,
        heapUsed: sample.heapUsed,
      }
    }
  }

  stats.push(msg);

  // request({
  //   method: 'POST',
  //   uri: conf.api_uri,
  //   headers: {
  //     Authorization: conf.api_key
  //   },
  //   body: JSON.stringify(msg)
  // }, function(error, response, body) {
  //   console.log('ERR', error);
  // });

}

module.exports.start = function(stat, cnf, tst) {
  if (!cnf.mem) return;
  if (running) {
    module.exports.stop.apply(this, arguments);
  }

  if (typeof interval == 'undefined') {
    interval = setInterval(postSample, cnf.mem_interval);
  } else {
    if (cnf.mem_interval !== conf.mem_interval) {
      clearInterval(interval);
      interval = setInterval(postSample, cnf.mem_interval);
    }
  }

  stats = stat;
  conf = cnf;
  test = tst;
  running = true;

  postSample();
}

module.exports.stop = function() {
  if (!running) return;
  postSample();
  clearInterval(interval);
  interval = undefined;
}
