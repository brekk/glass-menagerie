#!/usr/bin/env node
const {file} = require(`./lib/util/jsx-to-pug`).default
const {json} = require(`./lib/util/fs`).default
const yaml = require('./lib/util/yaml').default
const program = require(`commander`)

program
  .version(`0.0.1`)
  .option(`-d, --debug`, `log additional info`)
  .option(`-p, --props <p>`, `raw props`, yaml)
  .option(`-f, --file <f>`, `prop file`, json)
  .parse(process.argv)

if (!program.props && !program.file) {
  process.stderr.write(
    `glass needs props in order to render (glass -p={} json) or (glass -f=propfile.json file)`
  )
}

const filename = program.args[0]
if (!filename) {
  process.stderr.write(`glass expected to be given filename to consume (glass -p={} file)`)
}

const props = program.props || program.file

file.toPug(props, filename).fork(
  (e) => process.stderr.write(e),
  (p) => process.stdout.write(p)
)
