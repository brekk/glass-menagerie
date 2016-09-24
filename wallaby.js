const babel = require(`babel-core`)

module.exports = function configureWallaby(wallaby) {
  return {
    files: [
      {pattern: `node_modules/babel-polyfill/dist/polyfill.js`, instrument: false},
      `src/**/*.js`,
      `src/*.js`
    ],

    tests: [
      `tests/**/*`,
      `tests/*`
    ],

    env: {
      type: `node`
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel({
        babel,
        presets: [`es2015`, `stage-0`, `react`]
      })
    },

    bootstrap: () => {
      global.regeneratorRuntime = require(`babel-runtime/regenerator`).default
    },

    testFramework: `ava`,

    debug: true
  }
}
