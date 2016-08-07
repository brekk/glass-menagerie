import path from 'path'
import flow from 'lodash/fp/flow'
import React from 'react'
import server from 'react-dom/server'
import html2jade from 'html2jade'
import Task from 'data.task'

import trace from './trace'
import {resolveTask} from './task'

require(`babel-core/register`)({
  plugins: [
    `syntax-jsx`,
    `transform-react-jsx`
  ]
})

export const jsx = {
  toHTML: flow(
    React.createElement,
    server.renderToStaticMarkup
  )
}

export const htmlToPug = (html) => {
  return new Task((reject, resolve) => {
    if (typeof html !== `string`) {
      return reject(new TypeError(`Expected to be given html string.`))
    }
    html2jade.convertHtml(html, {bodyless: true}, (err, jade) => {
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

jsx.toPug = flow(
  trace(`jsx`),
  jsx.toHTML,
  trace(`html`),
  htmlToPug
)

jsx.toJade = flow(
  jsx.toPug,
  (x) => {
    console.warn(`[deprecated] This format and method is going away once pug is out of beta.`)
    return x
  }
)

jsx.toHTMLTask = flow(
  jsx.toHTML,
  resolveTask
)

export const file = {
  toHTML: flow(
    path.resolve,
    require,
    jsx.toHTML
  )
}
// export const jsx2pug = flow(
//
// )

export default {
  jsx,
  file
}
