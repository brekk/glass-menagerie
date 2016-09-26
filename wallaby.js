function hook() {
  global.regeneratorRuntime = require(`babel-runtime/regenerator`)
}

module.exports = function _configureWallaby(wallaby) {
  return {
    files: [
      {pattern: `node_modules/babel-polyfill/dist/polyfill.js`, instrument: false},
      `src/**/*.js`,
      `lib/cli/*.js`,
      `tests/fixtures/**`
    ],
    env: {
      type: `node`
    },
    compilers: {
      [`**/*.js`]: wallaby.compilers.babel()
    },
    setup: hook,
    bootstrap: hook,
    debug: `true`,
    testFramework: `ava`,
    tests: [
      `tests/**/spec-*.js`,
      // can't figure out how to get this working with wallaby yet
      `!tests/cli/spec-glass.js`
    ]
  }
}
