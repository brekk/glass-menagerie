#!/usr/bin/env node
const {file} = require(`./lib/util/jsx-to-pug`).default
const program = require(`commander`)

program
  .version(`0.0.1`)
  .option(`-d, --debug`, `log additional info`)
  .parse(process.argv)

file.toPug(program.args[0]).fork(
  process.stderr.write,
  process.stdout.write
)
