import path from 'path'
import flow from 'lodash/fp/flow'
import curry from 'lodash/fp/curry'
import map from 'lodash/fp/map'
import React from 'react'
import server from 'react-dom/server'
import html2jade from 'html2jade'
import Task from 'data.task'

// import trace from './trace'
import {resolveTask} from 'f-utility/core/task'

require(`babel-core/register`)({
  plugins: [
    `syntax-jsx`,
    `transform-react-jsx`
  ]
})

const createElement = curry(function _createElement(props, html) {
  if (props && props.children && props.children.length > 0) {
    const {children, ...otherProps} = props
    return React.createElement(html, otherProps, ...map(React.createElement, children))
  }
  return React.createElement(html, props)
})

export const jsx = {
  toHTML: curry(function jsxToHTML(props, raw) {
    const puller = flow(
      createElement(props),
      server.renderToStaticMarkup
    )
    return puller(raw)
  })
}

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

jsx.toPug = curry(function _toPug(props, rawJSX) {
  const jsxToPug = flow(
    jsx.toHTML(props),
    htmlToPug
  )
  return jsxToPug(rawJSX)
})

export const depText = `[deprecated] This format and method is going away once pug is out of beta.`

jsx.toJade = curry(function _toJade(props, rawJSX) {
  const jsxToPug = flow(
    jsx.toPug(props),
    (x) => {
      console.warn(depText) // eslint-disable-line no-console
      return x
    }
  )
  return jsxToPug(rawJSX)
})

jsx.toHTMLTask = (props, rawJSX) => {
  const consumer = flow(
    jsx.toHTML(props),
    resolveTask
  )
  return consumer(rawJSX)
}

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

const resolveFilePath = flow(
  path.resolve,
  require,
  unwrapDefault
)

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
