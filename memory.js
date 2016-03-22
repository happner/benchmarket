var running = false;
var stats, conf, test;

var postSample = function() {
  console.log('POST SAMPLE', test.title);
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
}

module.exports.stop = function() {
  if (!running) return;
  clearInterval(interval);
  interval = undefined;
}
