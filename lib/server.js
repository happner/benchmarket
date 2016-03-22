var API_KEY = process.env.API_KEY || 'xxx';
var IFACE = process.env.IFACE || '0.0.0.0';
var PORT = process.env.PORT || 3001;
var ELASTIC_HOST_1 = process.env.ELASTIC_HOST_1 || "http://10.0.0.1:9200";
var ELASTIC_HOST_2 = process.env.ELASTIC_HOST_2 || "http://10.0.0.2:9200";
var ELASTIC_HOST_3 = process.env.ELASTIC_HOST_3 || "http://10.0.0.3:9200";

var connect = require('connect');
var bodyParser = require('body-parser');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  hosts: [ELASTIC_HOST_1, ELASTIC_HOST_2, ELASTIC_HOST_3]
});

console.log(client);


var app = connect();

app.use(bodyParser.json());

app.use('/benchmarks', function(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 404;
    return res.end();
  }

  if (typeof req.headers.authorization === 'undefined' || req.headers.authorization !== API_KEY) {
    res.statusCode = 401;
    return res.end();
  }

  if (Object.keys(req.body).length == 0) {
    res.statusCode = 400;
    return res.end();
  }

  res.statusCode = 201;
  res.end();
});

app.listen(PORT, IFACE, function() {
  console.log('%s listening %s:%s', new Date(), IFACE, PORT);
});
