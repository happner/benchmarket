# benchmarket

Mocha Test Bench Marks

Slapped Together In A Hurry

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

### Authorization: xxx in above is ROOT_API_KEY as set in .env file
```

## Usage (client in tests)

Use in tests to create benchmark metrics. Currently only memory stats.

```javascript
describe('suite name', function() {

  require('benchmarket').start();

  after(require('benchmarket').stop);

  // all tests are transparently wrapped in benchmarket function

  it('test 1', function(done) {});
  it('test 2', function(done) {});

});
```

## Config (client in tests)

### The config file

Place `.benchmarket.js` into your test directory.

```js
module.exports = {

  api_key: '9c572bf0-eca1-4247-8bef-d1df51d42239', // as from /register
  api_uri: 'http://your.server/benchmarks'

  repo: 'name',

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
  api_key: '9c572bf0-eca1-4247-8bef-d1df51d42239', // as from /register
  api_uri: 'http://your.server/benchmarks',
  repo: 'none',
}
```

at `/home/me/git/happn/.benchmarket.js`
```js
// This will apply an alternative repo but still use the same api_key and api_uri (from uptree)
// for only the happn repo.
module.exports = {
  repo: 'happn',
}
```

**IMPORTANT:** To disable a boolean config declared uptree set it to `null`

***

## Server Usage

```bash
npm install

cp database.json.example database.json
vi database.json

brew install postgres # and make it run per instructions (manually or as service)
createdb benchmarket_development
# if not defaults already works (eg osx dev workstation) # createuser benchmarket
# if not defaults already works (eg osx dev workstation) # su postgres
# if not defaults already works (eg osx dev workstation) # psql
# if not defaults already works (eg osx dev workstation) # > ALTER ROLE benchmarket WITH PASSWORD 'yourpassword';

node_modules/.bin/db-migrate -e development up

cp .env.example .env
vi .env
bin/server
```

