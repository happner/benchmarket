# benchmarket

Mocha Benchmark

## Client Usage

### Benchmark All Tests

```javascript
describe('suite name', function() {

  require('benchmarket').start();

  after(function() {
    require('benchmarket').stop();
  });

  // all tests are transparently wrapped in benchmarker function

  it('test 1', function(done) {});
  it('test 2', function(done) {});

});
```

### Benchmark Specific Test

```javascript
var bench = require('benchmarket').bench;

describe('suite name', function() {

  it('test 1', function(done) {
    // not benchmarked
  });

  it('test 2', bench(function(done) {
    // is benchmarked
  }));

});
```


## Configure

Create a `.benchmarket.js` file in your home or test directory.

**IMPORTANT:** The configurer searches up your directory tree, deeper configs override shallower.

**IMPORTANT:** To disable a boolean config declared uptree set it to `null`

### Config Options

Shown with defaults.

```javascript
module.exports = {

  // include memory usage in benchmarks
  mem: true,

  // interval for memory sampling
  mem_interval: 5000,

}
```

***

## Server Usage

```javascript
# npm install foreman -g
nf start
```
