#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'
import mkdirp from 'mkdirp-bluebird'
import program from 'commander'
import readPkgUp from 'read-pkg-up'
import pkgDir from 'pkg-dir'
import register from 'babel-core/register'
import poly from 'babel-polyfill'
import _debug from 'debug'
import globby from 'globby'
import zip from 'lodash/fp/zip'
import curry from 'lodash/fp/curry'
import map from 'lodash/fp/map'
import flow from 'lodash/fp/flow'
// import forEach from 'lodash/fp/forEach'
import {mergePairs} from 'f-utility/fp/merge-pairs'
import {yaml} from '../yaml'
register()
const noop = () => {}
noop(poly)

const debug = _debug(`glass-menagerie:cli`)

import {readJSONOrYAML, glassMenagerie, autoMock, makePugKeyValues} from '../glass-menagerie'

const relativePath = curry(function _relativePath(dir, x) {
  return path.relative(dir, x)
})

const writeFiles = (out) => {
  debug(`writeFiles#input`, out)
  const [, {path: newPath, altered}] = out
  fs.writeFileSync(newPath, altered, `utf8`)
  return out
}

async function run() {
  const json = await readPkgUp()
  const dir = await pkgDir()
  const relativize = relativePath(dir)

  const {pkg} = json
  const {glass: config} = pkg
  program
    .version(pkg.version)
    .option(`-p, --props <p>`, `raw props`, yaml)
    .option(`-f, --file <f>`, `prop file`, readJSONOrYAML)
    .option(`-o, --output <o>`, `save output to file`)
    .option(`-a, --allow-empty-props`, `be lax on the explicit propTypes export rule`)
    .parse(process.argv)

  if (!program.props && !program.file) {
    if (!config || !config.files || (!config.output && !program.output)) {
      process.stderr.write([
        `glass needs flags in order to render\n`,
        `(glass -p "text: value\\nlink: item" file.jsx) or`,
        `(glass -f <file.json|yml> file.jsx)\n`,
        `or set a "glass" config in your package.json\n`
      ].join(` `))
      process.exit(1)
    }
    const output = program.output || config.output
    const allowError = program.allowEmptyProps || config.allowEmptyProps
    await mkdirp(relativize(output))

    debug(`config`, config)
    const relFiles = map(relativize, config.files)
    debug(`relFiles`, relFiles)
    const files = await globby(relFiles)
    const mockAll = map(autoMock(allowError))
    const mockups = mockAll(files)
    debug(`mockups`, mockups)
    Promise.all(mockups).then((converted) => {
      debug(`conversions`, converted)
      try {
        const list = flow(
          zip(files),
          map(makePugKeyValues(config, relativize)),
          map(writeFiles),
          mergePairs
        )(converted)
        process.stdout.write(JSON.stringify(list, null, 2))
      } catch (e) {
        process.stderr.write(e)
        process.exit(1)
      }
    }).catch((e) => process.stderr.write(e.toString()))
    return
  }

  const filename = program.args[0]
  if (!filename) {
    process.stderr.write(`glass expected to be given filename to consume (glass -f json file.js)\n`)
    process.exit(1)
  }

  const props = program.props || program.file

  // const writeToFile = writeFile(program.output)

  const writers = {
    // error: program.output ? writeToFile : process.stderr.write,
    // success: program.output ? writeToFile : process.stdout.write
    error: (e) => process.stderr.write(e),
    success: (o) => process.stdout.write(o)
  }

  try {
    const outcome = glassMenagerie(props, filename)
    outcome.fork(
      writers.error,
      writers.success
    )
  } catch (e) {
    process.stderr.write(`error while running glass cli - ` + e.toString())
    if (e.stack) {
      process.stderr.write(e.stack)
    }
  }
}

run()
