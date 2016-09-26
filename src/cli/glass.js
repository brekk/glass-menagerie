#!/usr/bin/env node
import fs from 'fs'
// import path from 'path'
import Promise from 'bluebird'
// import mkdirp from 'mkdirp-bluebird'
import program from 'commander'
import readPkgUp from 'read-pkg-up'
import pkgDir from 'pkg-dir'
import register from 'babel-core/register'
import poly from 'babel-polyfill'
import _debug from 'debug'
import globby from 'globby'
import zip from 'lodash/fp/zip'
// import curry from 'lodash/fp/curry'
import map from 'lodash/fp/map'
import id from 'lodash/fp/identity'
import flow from 'lodash/fp/flow'
import {makeTracer} from 'f-utility/dev/debug'
// import forEach from 'lodash/fp/forEach'
import {mergePairs} from 'f-utility/fp/merge-pairs'
// import {yaml} from '../yaml'
register()
const noop = () => {}
noop(poly)

const GLASS = `glass-menagerie`

const _trace = makeTracer(GLASS)
const trace = {
  generate: _trace([`cli`, `generate`])
}

const debug = _debug(`glass-menagerie:cli`)

// import {requireWithPropTypes} from '../proptypes'

import {
  readJSONOrYAML,
  // glassMenagerie,
  autoMock,
  makePugKeyValues
} from '../glass-menagerie'

// const relativePath = curry(function _relativePath(dir, x) {
//   return path.relative(dir, x)
// })

export const messages = {
  noParams: [
    `glass needs flags in order to render\n`,
    `(glass -p "text: value\\nlink: item" -f file.jsx) or`,
    `(glass -p file.{json,yml} -f file.jsx)\n`,
    `or point at a config file (glass -c glass.json)\n`,
    `or set a "glass" config in your package.json\n`
  ].join(` `)
}

const writeFiles = (out) => {
  debug(`writeFiles#input`, out)
  const [, {path: newPath, altered}] = out
  fs.writeFileSync(newPath, altered, `utf8`)
  return out
}

export async function generate(config, relativize, allowError, noWrite) {
  debug(`config`, config)
  const relFiles = map(relativize, config.files)
  debug(`relFiles`, relFiles)
  const files = await globby(relFiles)
  debug(`files`, files)
  const mockAll = map(autoMock(allowError))
  const mockups = mockAll(files)
  const writeOrPipe = noWrite ? id : writeFiles
  debug(`allow write?`, noWrite)
  return Promise.all(mockups).then((converted) => {
    debug(`conversions`, converted)
    try {
      const list = flow(
        trace.generate(`# input`),
        zip(files),
        trace.generate(`# zipped`),
        map(makePugKeyValues(config, relativize)),
        trace.generate(`# keyed`),
        map(writeOrPipe),
        trace.generate(`# write or piped`),
        mergePairs,
        trace.generate(`# output`)
      )(converted)
      process.stdout.write(JSON.stringify(list, null, 2))
    } catch (e) {
      process.stderr.write(e)
      process.exit(1)
    }
  }).catch((e) => process.stderr.write(e.toString()))
}

async function run() {
  const json = await readPkgUp()
  const dir = await pkgDir()
  process.chdir(dir)
  // const relativize = relativePath(dir)

  const {pkg} = json
  // const {glass: config} = pkg

  function list(val) {
    return val.split(`,`)
  }

  program
    .version(pkg.version)
    .option(`-c, -C, --config <c>`, `a path to a config file written in JSON or YAML`)
    .option(
      `-d, -D, --dir, --directory <d>`,
      `generate output to this directory, on a per file basis`
    )
    .option(`-f, -F, --files, --file <f>`, `single file or glob, optionally comma-delimited`, list)
    .option(`-i, -I, --include <i>`, `a globby path of things to include explicitly`, list)
    .option(`-l, -L, --log <l>`, `generate a log file of the operation`)
    .option(
      `-n, -N, --no-config`,
      `explicitly ignore existing configuration. This flag beats --config.`
    )
    .option(`-o, -O, --output <o>`, `generate output to this directory, on a per file basis`)
    .option(
      `-p, -P, --props <p>`,
      `a prop file, raw props, or the literal strings "lax" or "infer" (the default)`,
      readJSONOrYAML
    )
    .option(`-w, -W, --watch`, `Watch files and automatically regenerate on change`)
    .option(
      `-x, -X, --exclude <x>`,
    [
      `A globby path of things to exclude explicitly.`,
      `This flag beats --include on identical matches.`
    ].join(` `),
      list
    )
    .parse(process.argv)

  /*
  const rawProps = program.props || program.propFile
  const output = program.output || config.output
  const noWrite = program.noWrite || config.noWrite || false
  if (output && !noWrite) {
    await mkdirp(relativize(output))
  }
  const allowError = program.allowEmptyProps || config.allowEmptyProps
  debug(`__ settings:`, {...program, ...config})
  const noConfig = program.noConfig || false
  if (!noConfig || !rawProps && !program.autoMock) {
    if (!config || (!config.output && !program.output)) {
      process.stderr.write(noParamsMessage)
      process.exit(1)
    }
    generate(config, relativize, allowError, noWrite)
    return
  }
  const refFiles = program.files.length > 1 ?
    program.files :
    program.files[0]
  const filename = program.args[0] || refFiles
  if (!filename) {
    process.stderr.write(
      `glass expected to be given filename to consume (glass -q props.json file.js)\n`
    )
    process.exit(1)
  }

  const writers = {
    error: (e) => process.stderr.write(e),
    success: (o) => process.stdout.write(o)
  }
  try {
    let props = {}
    debug(`filename`, filename)
    const filenameIsGlobby = Array.isArray(filename) || filename.indexOf(`*`) > -1
    if (filenameIsGlobby) {
      const genConfig = {...config, files: [filename]}
      genConfig.allowEmptyProps = allowError
      genConfig.output = output
      generate(genConfig, relativize, allowError, noWrite)
      return
    }
    if (!rawProps && allowError && program.autoMock) {
      props = await requireWithPropTypes(allowError, filename)
    } else {
      writers.error(`Expected to be given props or to find them within the files.`)
      return
    }
    const outcome = glassMenagerie(props, filename)
    outcome.fork(
      writers.error,
      writers.success
    )
  } catch (e) {
    writers.error(`error while running glass cli - ` + e.toString())
    if (e.stack) {
      writers.error(e.stack)
    }
  }
*/
}

run()
// */
