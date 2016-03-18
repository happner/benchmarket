# benchmarket

Mocha Benchmark

### Usage

#### Benchmark All Tests

```javascript
describe('suite name', function() {

  require('benchmarket').start();

  after(function() {
    require('benchmarket').stop();
  });

  // all tests are wrapped in benchmarker function

  it('test 1', function(done) {});
  it('test 2', function(done) {});

});
```

#### Benchmark Specific Test

```javascript
var bench = require('benchmarket').bench

describe('suite name', function() {

  it('test 1', function(done) {
    // not benchmarked
  });

  it('test 2', bench(function(done) {
    // is benchmarked
  }));

});
```


### Configure

Create a `.benchmarket.js` file in your home or test directory.

**IMPORTANT:** The configurer searches up your directory tree, deepest configs override shallower.



