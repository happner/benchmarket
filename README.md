# benchmarket

Mocha Test Bench Marks

## Usage (client)

Use in tests to create benchmark metrics. Currently only memory stats.

```javascript
describe('suite name', function() {

  require('benchmarket').start();

  after(require('benchmarket').stop);

  // all tests are transparently wrapped in benchmarkek function

  it('test 1', function(done) {});
  it('test 2', function(done) {});

});
```

## Config (client)

### The config file

Place `.benchmarket.js` into your test directory.

```js
module.exports = {

  api_key: 'xxx'
  api_uri: 'http://your.server/benchmarks'

  // include memory usage in benchmarks
  mem: true,
  mem_interval: 5000,

}
```

### Composite config

The configurer runs ahead of each test. It searches for `.benchmarket.js` by walking up the directory tree (toward root), starting from the directory containing the testfile.

It loads config keys from each found file. The first encountered key wins in cases where a key is found in multiple locations during the walk.

eg.

at `/home/me/git/.benchmarket.js`
```js
// This will apply to all git repos nested in /home/me/git/
module.exports = {
  api_key: 'xxx'
  api_uri: 'http://your.server/benchmarks'
}
```

at `/home/me/git/happn/.benchmarket.js`
```js
// This will apply an alternative api_uri but still use the same api_key (from uptree)
// for only the happn repo.
module.exports = {
  api_uri: 'http://your.server/benchmarks'
}
```

**IMPORTANT:** To disable a boolean config declared uptree set it to `null`

***

## Server Usage

```javascript
# npm install foreman -g
nf start
```
