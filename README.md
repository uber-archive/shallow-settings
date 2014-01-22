# shallow-settings [![Build status](https://travis-ci.org/uber/shallow-settings.png?branch=master)](https://travis-ci.org/uber/shallow-settings)

Shallow inheritance-based settings for your application

This was based off of [mgutz/node-settings][] but implements a shallow clone over a deep clone to make output more predictable. Additionally, it features lazy loading for instantiaion inside of your configuration itself.

[mgutz/node-settings]: https://github.com/mgutz/node-settings

## Getting Started
Install the module with: `npm install shallow-settings`

```javascript
// Define our settings
var Settings = require('shallow-settings');
var settings = new Settings({
  common: {
    hello: 'world',
    nested: {
      key: 'value'
    }
  },
  development: {
    nested: {
      hai: 'there'
    }
  }
});

// Retrieve the settings for our environment
settings.getSettings({env: 'development'});
/*
{
  ENV: 'development',
  hello: 'world',
  nested: {
    hai: 'there'
  }
}
*/
```

## Documentation
`shallow-settings` defines `Settings` as its `module.exports`.

### `new Settings(configs)`
Constructor for creating a new settings factory

- configs `Object` - Container for different sets of settings
  - configs.common `Object` - Required base settings set that all other settings will inherit from
  - configs.* `Object` - Any other settings you would like to set

### `settings.getSettings(options)`
Extract and instantiate a set of settings based off given environment. We take the `common` environment and extend over it with the passed in environment's settings.

After that, we run the lazy load functions to run anything that needs to be instantiated.

For sanitation of original data, we deep clone the settings we will return.

- options `Object` - Container for parameters
    - env `String` - Environment to load settings from

### `Settings.lazy(fn)`
Mark a function to be lazy loaded. The return function *must be* a top level function for a config.

- fn `Function` - Function to mark for lazy loading

## Examples
Below is an example of using lazy loading:

```javascript
// Define our settings
var redis = require('redis');
var Settings = require('shallow-settings');
var settings = new Settings({
  common: {
    redis: Settings.lazy(function () {
      return redis.createClient(9001);
    })
  },
  production: {
    redis: Settings.lazy(function () {
      return redis.createClient(9002);
    })
  }
});

// Currently, no redis instances have been loaded

// Load up our production redis (and make no calls to port `9001`)
settings.getSettings({env: 'production'});
/*
{
  ENV: 'production',
  redis: {
    stream: {
      _handle: {
        writeQueueSize: 0,
        ...
      }
    }
  }
}
*/
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt) and test via `npm test`.

## License
Copyright (c) 2014 Uber

Licensed under the MIT license.
