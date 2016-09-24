#!/usr/bin/env node
import program from 'commander'
// import {writeFile} from 'f-utility/core/task'
import register from 'babel-core/register'
import {yaml} from '../yaml'
register()

import {readJSONOrYAML, glassMenagerie} from '../glass-menagerie'

program
  .version(`0.0.1`)
  .option(`-p, --props <p>`, `raw props`, yaml)
  .option(`-f, --file <f>`, `prop file`, readJSONOrYAML)
  .option(`-o, --output <o>`, `save output to file`)
  .parse(process.argv)

if (!program.props && !program.file) {
  process.stderr.write([
    `glass needs props in order to render\n`,
    `(glass -p "text: value\\nlink: item" file.jsx) or`,
    `(glass -f <file.json|yml> file.jsx)\n`
  ].join(` `))
  process.exit(1)
}

const filename = program.args[0]
if (!filename) {
  process.stderr.write(`glass expected to be given filename to consume (glass -f json file.js)`)
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
