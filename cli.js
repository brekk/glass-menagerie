#!/usr/bin/env node
const {file: jsxFile} = require(`./lib/util/jsx-to-pug`).default
const {json} = require(`./lib/util/fs`).default
const {yaml, yamlFile} = require(`./lib/util/yaml`)
const {writeFile} = require(`./lib/util/task`)
const program = require(`commander`)
const path = require(`path`)

const readJSONOrYAML = (file) => {
  const extension = path.extname(file)
  if (extension === `.yml` || extension === `.yaml`) {
    return yamlFile(file)
  }
  return json(file)
}

program
  .version(`0.0.1`)
  .option(`-d, --debug`, `log additional info`)
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
  const outcome = jsxFile.toPug(props, filename)
  outcome.fork(
    writers.error,
    writers.success
  )
} catch (e) {
  console.log(`error while running glass cli - `, e.toString())
  if (e.stack) {
    console.log(e.stack)
  }
}
