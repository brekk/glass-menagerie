import flow from 'lodash/fp/flow'
import yml from 'js-yaml'
import {readFile} from 'f-utility/core/fs'

import {makeTracer} from 'f-utility/dev/debug'
const _trace = makeTracer(`glass-menagerie`)
const trace = {
  yaml: _trace([`yaml`]),
  yamlFile: _trace([`yamlFile`])
}

const {safeLoad: parse} = yml

/**
 * Translate newlines to the escaped version
 * @function fixNewLines
 * @param {string} x - a string, ideally a line
 * @return {string} fixed line
 */
const fixNewLines = (x) => x.replace(/\\n/g, `\n`)

/**
 * Translate raw yaml to json
 * @function yaml
 * @borrows js-yaml#safeLoad
 * @borrows fixNewLines
 * @param {string} x
 * @return {object} out
 */
export const yaml = flow(
  trace.yaml(`# input`),
  fixNewLines,
  parse,
  trace.yaml(`# output`)
)

/**
 * Translate raw yaml file to json
 * @function yamlFile
 * @borrows js-yaml#safeLoad
 * @borrows fixNewLines
 * @param {string} filepath
 * @return {object} out
 */
export const yamlFile = flow(
  trace.yamlFile(`# input`),
  readFile,
  fixNewLines,
  parse,
  trace.yamlFile(`# output`)
)

export default yaml
