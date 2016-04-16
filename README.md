# benchmarket

Mocha Test Bench Marks

## Register

To get api_key (for use in tests) and set username and password (for viewing data)

```bash
curl -i -H "Authorization: xxx" \
        -H "Content-Type: application/json" \
        -X POST http://localhost:8000/register -d '{
  "username": "u",
  "password": "p"
}'
### result (keep assigned api_key)
{"username":"u","password":"p","api_key":"9c572bf0-eca1-4247-8bef-d1df51d42239"}

### Authorization: xxx in above is ROOT_API_KEY as set in .env file (see benchmarket-server repo)
```

## Usage (client in tests)

Use in tests to create benchmark metrics.
* A `start()` and `stop()` method needs to be placed before and after all tests to be benchmarked.
* A `store()` method needs to be called from an `after` hook.

```javascript
var bench = require('benchmarket');
describe('suite name', function() {

  bench.start();
  after(bench.store());

  // Test 1 and 2 are wrapped in a benchmark function that measures:
  // a. Test duration.
  // b. Memory (HeapUsed delta, how much _more_ memory is in use
  //    for having run the test.

  it('test 1', function() {});
  it('test 2', function() {});

  bench.stop();

  it('test 3', functoin() {});

});
```

### Bench Only Specific Tests

Wrap selected tests into the bench function (decorator)

```javascript
var bench = require('benchmarket');
describe('suite name', function() {
  
  after(bench.store());

  it('test1', bench(function(done) {
    done();
  }));

});
```


### Inline Custom Metrics

Additional metrics can be created in tests by submitting a `name` and `value`. It suports only numerical values.

```javascript
it('test title', function() {
  bench.metric('pi', 3.14);
})
```

### Inline Store Timeout

The `bench.store()`, as called is the after hook does the writing of all accumulated metrics to the server. This may sometimes take longer that the default or configured value (see config below). Already a default of 6 seconds extends the mocha default of 2.

The `bench.store()` function further allows for the passing of a timeout to override for just _this_ testfile.

```javascript
var bench = require('benchmarket');
describe('suite name', function() {
  //...
  after(bench.store({timeout: 9000}));

  //...
});
```

## Config (client in tests)

### The config file

Place `.benchmarket.js` into your test directory.

```js
module.exports = {
  
  api_key: '9c572bf0-eca1-4247-8bef-d1df51d42239', // as from /register
  api_uri: 'http://your.server/benchmarks'
  timeout: 6000, // set timeout to wait for metric store()

  // These are auto detected during the test run but can be overridden
  // by adding them here instead.
  repo: 'name-of-repo',
  dirname: '/home/of/repo',
  host: 'computer name',

}
```

### "Hiding" config in parent directory.

The configurer runs ahead of each testfile. It searches for `.benchmarket.js` by walking up the directory tree (toward root), starting from the directory containing the testfile.

It loads config keys from each found file. The first encountered key wins in cases where a key is found in multiple locations during the walk.

eg. A config placed in the parent directory of all git repos will apply to all and can keep the sensitive parts of the config out of the repos.

at `/home/me/git/.benchmarket.js`
```js
module.exports = {
  api_key: '9c572bf0-eca1-4247-8bef-d1df51d42239', // as from /register
  api_uri: 'http://your.server/benchmarks',
}
```

