import flow from 'lodash/fp/flow'
import yml from 'js-yaml'
import {readFile} from 'f-utility/core/fs'

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
  fixNewLines,
  parse
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
  readFile,
  fixNewLines,
  parse
)

export default yaml
