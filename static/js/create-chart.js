CreateChart = function(scope, metric) {

  var id = scope.file.name + scope.test.name + metric.name;
  var div = document.getElementById(id);


  var margin = {
    top: 3,
    right: 20,
    bottom: 30,
    left: 50
  };

  var width = 900 - margin.left - margin.right;
  var height = 150 - margin.top - margin.bottom;

  var formatDate = d3.time.format('%d-%b-%y');

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom');
  var yAxis = d3.svg.axis().scale(y).orient('left');

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

  var svg = d3.select(div).append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  /*
   * add header and trailer (records) to cause x and y axis to span
   * start to end date per half, hour, day, week, month, year
   *
   * these records are only present during axis domain scan and are
   * removed before drawing the line
   */

  var min = 10000000000;
  var max = -10000000000;

  metric.values.forEach(function(v) {
    if (v.value < min) min = v.value;
    if (v.value > max) max = v.value;
  });

  if (min === max) {
    // otherwise the line goes along the x axis and there are
    // no scale labels on the y axis
    min--;
    max++;
  }

  var startDate, endDate = new Date();

  metric.values.push({
    value: max,
    date: endDate
  });

  switch (scope.setSpan) {
    case 'hour':
      startDate = new Date()
      startDate.setTime(startDate.getTime() - (1000 * 60 * 60));
      break;
    case 'day':
      startDate = new Date()
      startDate.setTime(startDate.getTime() - (1000 * 60 * 60 * 24));
      break;
    case 'week':
      startDate = new Date()
      startDate.setTime(startDate.getTime() - (1000 * 60 * 60 * 24 * 7));
      break;
    case 'month':
      startDate = new Date()
      startDate.setTime(startDate.getTime() - (1000 * 60 * 60 * 24 * 7 * 4));
      break;
    case 'year':
      startDate = new Date()
      startDate.setTime(startDate.getTime() - (1000 * 60 * 60 * 24 * 7 * 4 * 12));
      break;
  }

  metric.values.unshift({
    value: min,
    date: startDate
  });

  x.domain(d3.extent(metric.values, function(d) { return d.date; }));
  y.domain(d3.extent(metric.values, function(d) { return d.value; }));

  metric.values.pop();
  metric.values.shift();

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);


  svg.append('path')
    .datum(metric.values)
    .attr('class', 'line')
    .attr('d', line);

}
