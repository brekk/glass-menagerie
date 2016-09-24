import path from 'path'
// import {writeFile} from 'f-utility/core/task'
import curry from 'lodash/fp/curry'
import register from 'babel-core/register'
import {debug as makeDebugger} from 'f-utility/dev/debug'
import {json} from 'f-utility/core/fs'
import {isType} from 'f-utility/core/validators'
import {yaml, yamlFile} from './yaml'
import {file as jsxFile} from './jsx-to-pug'
import {createMock} from './proptypes'
register()

const _debug = makeDebugger(`glass-menagerie`)
const debug = {
  readJSONOrYAML: _debug([`readJSONOrYAML`]),
  glass: _debug(`main`)
}

/**
 * @function readJSONOrYAML
 * @param {string} file - file to read
 * @return {object} parsed object
 */
export const readJSONOrYAML = (file) => {
  debug.readJSONOrYAML(`# input`, file)
  const extension = path.extname(file)
  if (extension === `.yml` || extension === `.yaml`) {
    const yamlData = yamlFile(file)
    debug.readJSONOrYAML(`# output`, yamlData)
    return yamlData
  }
  const out = json(file)
  debug.readJSONOrYAML(`# output`, out)
  return out
}

/**
 * test whether a string is a valid path
 * @function isValidFileName
 * @param {mixed} x - object or filename
 * @return {boolean} is it a filename?
 */
export const isValidFileName = (x) => {
  if (typeof x === `object`) {
    return false
  }
  const parsed = path.parse(x)
  if (x && x.indexOf(`\n`) === -1 &&
    parsed && parsed.ext && parsed.ext.length > 0) {
    return true
  }
  return false
}

/**
 * @function glassMenagerie
 * @param {mixed} props - either raw yaml props, an object, or a filepath
 */
export const glassMenagerie = curry(function _glassMenagerie(props, _jsxFile) {
  const isFile = isValidFileName(props)
  if (!isType.object(props) && !isFile) {
    props = yaml(props)
  } else if (isFile) {
    props = readJSONOrYAML(props)
  }
  return jsxFile.toPug(props, _jsxFile)
})

glassMenagerie.mock = curry(function _dummy(types, _jsxFile) {
  return jsxFile.toPug(createMock(types), _jsxFile)
})
