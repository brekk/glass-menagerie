// import fs from 'fs'
import path from 'path'
// import {writeFile} from 'f-utility/core/task'
import curry from 'lodash/fp/curry'
import register from 'babel-core/register'
import {debug as makeDebugger} from 'f-utility/dev/debug'
import {json} from 'f-utility/core/fs'
import {taskToPromise} from 'f-utility/core/task'
import {isType} from 'f-utility/core/validators'
import {yaml, yamlFile} from './yaml'
import {file as jsxFile} from './jsx-to-pug'
import {createMock, requireWithPropTypes} from './proptypes'
register()

const _debug = makeDebugger(`glass-menagerie`)
const debug = {
  readJSONOrYAML: _debug([`readJSONOrYAML`]),
  glass: _debug([`main`]),
  autoMock: _debug([`autoMock`]),
  makePugKeyValues: _debug(`makePugKeyValues`)
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

export const mock = curry(function _mock(types, _jsxFile) {
  return jsxFile.toPug(createMock(types), _jsxFile)
})

export const autoMock = curry(function _autoMock(allowError, file) {
  return requireWithPropTypes(allowError, file).then((types) => {
    debug.autoMock(`types`, types)
    const mocks = createMock(types)
    debug.autoMock(`mocks`, mocks)
    return taskToPromise(jsxFile.toPug(mocks, file))
  })
})

export const makePugKeyValues = curry(
  function _makePugKeyValues(config, relativize, pair) {
    if (!config || !config.output) {
      throw new TypeError(`Expected to be able to access config.output`)
    }
    if (typeof relativize !== `function`) {
      throw new TypeError(`Expected to receive relativize function.`)
    }
    if (!pair || !Array.isArray(pair) || pair.length !== 2) {
      throw new TypeError(`Expected to receive [key, value] pair.`)
    }
    const [k, v] = pair
    const {output} = config
    if (typeof k !== `string` || k.length < 1) {
      throw new TypeError(`Unable to read path of non-string.`)
    }
    const file = path.parse(k)
    debug.makePugKeyValues(`file`, file)
    const newPath = path.resolve(relativize(output), file.name + `.pug`)
    debug.makePugKeyValues(`newPath`, newPath)
    return [k, {path: newPath, raw: v, altered: `//- ${k}\n${v}`}]
  }
)
