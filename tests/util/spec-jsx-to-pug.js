import test from 'tape'
import id from 'lodash/fp/identity'
import curry from 'lodash/fp/curry'

import fixture from './fixture-jsx'
// import trace from '../../src/util/trace'
import {
  jsx,
  htmlToPug
  // ,jsxFile
} from '../../src/util/jsx-to-pug'

const {
  Hello
  // Log
} = fixture

test(`jsx.toHTML converts a jsx component into html`, (t) => {
  t.plan(2)
  t.equal(typeof jsx.toHTML, `function`)
  const output = jsx.toHTML(Hello)
  console.log(`>> output`, output)
  t.equal(output, `<p>Hello</p>`)
  t.end()
})

const testPug = curry((deprecated, t) => {
  const method = deprecated ? `toJade` : `toPug`
  t.plan(2)
  t.equal(typeof jsx[method], `function`)
  const outputPug = `p Hello\n`
  const task = jsx[method](Hello)
  task.fork(
    (e) => { throw e },
    (output) => {
      t.equal(output, outputPug)
      t.end()
    }
  )
})

test(`jsx.toPug converts a jsx component into jade / pug`, testPug(false))
test(`jsx.toJade converts a jsx component into jade / pug while whining`, testPug(true))

test(`jsx.htmlToPug should fail when given html which ain't a string`, (t) => {
  t.plan(2)
  t.equal(typeof htmlToPug, `function`)
  const outputTask = htmlToPug(false)
  outputTask.fork((e) => {
    t.equal(e.message, `Expected to be given html string.`)
    t.end()
  }, id)
})
