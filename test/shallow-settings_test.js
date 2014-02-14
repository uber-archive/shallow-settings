var expect = require('chai').expect;
var Settings = require('../');

describe('A set of `shallow-settings`', function () {
  before(function () {
    this.settings = new Settings({
      common: {
        hello: 'world',
        nested: {
          key: 'value'
        }
      },
      'shallow-override': {
        hello: 'moon'
      },
      'deep-override': {
        nested: {
          hai: 'there'
        }
      }
    });
  });

  it('can retrieve the common settings', function () {
    var actualSettings = this.settings.getSettings({env: 'common'});
    expect(actualSettings).to.deep.equal({
      ENV: 'common',
      hello: 'world',
      nested: {
        key: 'value'
      }
    });
  });

  it('can perform shallow overrides', function () {
    var actualSettings = this.settings.getSettings({env: 'shallow-override'});
    expect(actualSettings).to.deep.equal({
      ENV: 'shallow-override',
      hello: 'moon',
      nested: {
        key: 'value'
      }
    });
  });

  it('can perform deep overrides', function () {
    var actualSettings = this.settings.getSettings({env: 'deep-override'});
    expect(actualSettings).to.deep.equal({
      ENV: 'deep-override',
      hello: 'world',
      nested: {
        hai: 'there'
      }
    });
  });
});

describe('A set of lazy loaded `shallow-settings`', function () {
  before(function () {
    var that = this;
    this.settings = new Settings({
      common: {},
      'lazy-loaded': {
        lazy: Settings.lazy(function () {
          that.loaded = true;
          return 'hey';
        })
      }
    });
  });

  describe('retrieving common settings', function () {
    before(function () {
      this.actualSettings = this.settings.getSettings({env: 'common'});
    });

    it('does not include lazy settings', function () {
      expect(this.actualSettings).to.deep.equal({ENV: 'common'});
    });

    it('does not process lazy settings', function () {
      expect(this.loaded).to.equal(undefined);
    });
  });

  describe('retrieving lazy loaded settings', function () {
    before(function () {
      this.actualSettings = this.settings.getSettings({env: 'lazy-loaded'});
    });

    it('runs lazy settings', function () {
      expect(this.actualSettings).to.deep.equal({
        ENV: 'lazy-loaded',
        lazy: 'hey'
      });
    });
  });
});

describe('A set of asynchronous settings', function () {
  before(function registerAsyncSettings () {
    var that = this;
    this.settings = new Settings({
      common: {},
      'async-loaded': {
        async: Settings.lazy(function (cb) {
          setTimeout(function () {
            cb(null, 'hello');
          }, 100);
        })
      }
    });
  });

  describe('when retrieved', function () {
    before(function loadAsyncSettings (done) {
      var that = this;
      this.settings.getSettings({env: 'async-loaded'}, function (err, actualSettings) {
        that.actualSettings = actualSettings;
        done(err);
      });
    });

    it('retrieves the async data', function () {
      expect(this.actualSettings).to.deep.equal({
        ENV: 'async-loaded',
        async: 'hello'
      });
    });
  });
});
