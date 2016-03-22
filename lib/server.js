var API_KEY = process.env.API_KEY || 'xxx';
var IFACE = process.env.IFACE || '0.0.0.0';
var PORT = process.env.PORT || 3001;

var connect = require('connect');
var bodyParser = require('body-parser')

var app = connect();

app.use(bodyParser.json());

app.use('/stats', function(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 404;
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
