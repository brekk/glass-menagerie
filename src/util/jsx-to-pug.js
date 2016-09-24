import path from 'path'
import flow from 'lodash/fp/flow'
import curry from 'lodash/fp/curry'
import map from 'lodash/fp/map'
import React from 'react'
import server from 'react-dom/server'
import html2jade from 'html2jade'
import Task from 'data.task'
import {debug as makeDebugger} from 'f-utility/dev/debug'
const _debug = makeDebugger(`glass-menagerie:jsx-to-pug`)
const debug = {
  jsxToHTML: _debug([`jsx`, `toHTML`]),
  jsxToPug: _debug([`jsx`, `toPug`]),
  htmlToPug: _debug([`html`, `toPug`]),
  jsxToJade: _debug([`jsx`, `toJade`]),
  toHTMLTask: _debug([`jsx`, `toHTMLTask`]),
  unwrapDefault: _debug([`unwrapDefault`]),
  toJade: _debug([`toJade`])
}

import {resolveTask} from 'f-utility/core/task'

require(`babel-core/register`)({
  plugins: [
    `syntax-jsx`,
    `transform-react-jsx`
  ]
})

/**
 * A curried, props first wrapper for React.createElement
 * @function createElement
 * @curried
 * @borrows React#createElement
 * @param {object} props - component props
 * @param {string} html - raw
 * @return {object} jsx
 */
const createElement = curry(function _createElement(props, html) {
  if (props && props.children && props.children.length > 0) {
    const {children, ...otherProps} = props
    return React.createElement(html, otherProps, ...map(React.createElement, children))
  }
  return React.createElement(html, props)
})

/**
 * convert raw jsx to html
 * @function jsxToHTML
 * @curried
 * @param {object} props - component props
 * @param {string} html - raw
 * @return {object} jsx
 */
export const jsx = {
  toHTML: curry(function jsxToHTML(props, raw) {
    debug.jsxToHTML(`# input`, props, raw)
    const out = flow(
      createElement(props),
      server.renderToStaticMarkup
    )(raw)
    debug.jsxToHTML(`# output`, out)
    return out
  })
}

/**
 * convert raw jsx to html
 * @function jsxToHTML
 * @param {string} html - raw
 * @return {Task} error or jade
 */
export const htmlToPug = (html) => {
  return new Task(function _htmlToPugTask(reject, resolve) {
    if (typeof html !== `string`) {
      return reject(new TypeError(`Expected to be given html string.`))
    }
    html2jade.convertHtml(html, {bodyless: true}, function _htmlToPugCallback(err, jade) {
      // https://github.com/donpark/html2jade/blob/master/lib/html2jade.js#L718 this dumdum
      // ain't returning errors, so we can't get to here
      /* istanbul ignore if */
      if (err) {
        return reject(err)
      }
      resolve(jade)
    })
  })
}

/**
 * convert raw jsx to html
 * @function jsxToPug
 * @curried
 * @borrows htmlToPug
 * @param {object} props - component props
 * @param {string} rawJSX - raw jsx
 * @return {Task} error or jade
 */
jsx.toPug = curry(function _toPug(props, rawJSX) {
  const jsxToPug = flow(
    jsx.toHTML(props),
    htmlToPug
  )
  return jsxToPug(rawJSX)
})

const depText = `[deprecated] This format and method is going away once pug is out of beta.`

/**
 * convert raw jsx to html
 * @function jsxToJade
 * @curried
 * @borrows htmlToPug
 * @param {object} props - component props
 * @param {string} rawJSX - raw jsx
 * @return {Task} error or jade
 */
jsx.toJade = curry(function _toJade(props, rawJSX) {
  debug.jsxToJade(`# input`, props, rawJSX)
  const out = flow(
    jsx.toPug(props),
    (x) => {
      debug.toJade(depText)
      return x
    }
  )(rawJSX)
  debug.jsxToJade(`# output`, out)
  return out
})

/**
 * @function toHTMLTask
 * @param {object} props - component props
 * @param {string} jsx - raw jsx
 * @return {Task} error or html
 */
jsx.toHTMLTask = (props, rawJSX) => {
  debug.toHTMLTask(`# input`, props, rawJSX)
  const out = flow(
    jsx.toHTML(props),
    resolveTask
  )(rawJSX)
  debug.toHTMLTask(`# output`, out)
  return out
}

/**
 * In order to deal with es6 modules, we need to wrap the incoming data with a hook
 * @function unwrapDefault
 * @param {mixed} x - likely a function or object
 * @return {Task} error or module
 */
export const unwrapDefault = (x) => {
  return new Task(function unwrapDefaultTask(reject, resolve) {
    if (typeof x !== `function`) {
      if (x.default) {
        return resolve(x.default)
      } else {
        return reject(new TypeError(`Received something which is likely not a jsx module.`))
      }
    }
    return resolve(x)
  })
}

/**
 * Function for parsing file paths
 * @function resolveFilePath
 * @param {string} path - input path
 * @return {Task} error or module
 */
const resolveFilePath = flow(
  path.resolve,
  require,
  unwrapDefault
)

/**
 * convert file to jsx
 * @function fileTask
 * @param {function} method - a function to invoke
 * @param {object} props - component props
 * @param {string} filePath - file path
 * @return {Task} error or jsx
 */
const fileTask = curry(function _fileTask(method, props, filePath) {
  return new Task(function fileTaskRejectResolve(reject, resolve) {
    resolveFilePath(filePath).fork(reject, function internalResolveFile(jsxFile) {
      method(props, jsxFile).fork(reject, resolve)
    })
  })
})

export const file = {
  toHTML: fileTask(jsx.toHTMLTask),
  toPug: fileTask(jsx.toPug),
  toJade: fileTask(jsx.toFile)
}

export default {
  jsx,
  file
}
