// Load in dependencies
var assert = require('assert');
var _ = require('underscore');
var deepClone = require('clone');

// Define class to access settings from
function Settings(configs) {
  this.configs = configs;
}

// Create methods to tag and run lazy settings (e.g. instantiations)
Settings.lazy = function (fn) {
  fn.lazy = true;
  return fn;
};
// DEV: THIS WILL MUTATE THE ORIGINAL DATA
Settings.loadLazy = function (obj) {
  // DEV: Don't use a forEach loop to reduce the total stack while initializing items
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      var node = obj[key];
      if (typeof node === 'function' && node.lazy === true) {
        obj[key] = obj[key]();
      }
    }
  }
};

// Define accessor for settings
Settings.prototype.getSettings = function (options) {
  // Determine whether the environment has been found
  var configs = this.configs;
  var envConfig = configs[options.env];
  assert.notEqual(envConfig, undefined, 'Environment settings were not found under "' + options.env + '"');

  // Grab the settings for the environment
  var settings = _.defaults({}, envConfig, configs.common);
  settings = deepClone(settings);
  settings.ENV = options.env;

  // Memoize lazy functions
  // DEV: This mutates the data returned by settings
  Settings.loadLazy(settings);

  // Return the settings
  return settings;
};

// Export the settings
module.exports = Settings;
