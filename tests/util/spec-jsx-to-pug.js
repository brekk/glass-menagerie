import test from 'tape'
import id from 'lodash/fp/identity'
import curry from 'lodash/fp/curry'

import random from '../harness/random'
// import trace from '../../src/util/trace'
import {
  jsx,
  htmlToPug,
  file,
  unwrapDefault
} from '../../src/util/jsx-to-pug'

import Hello from './fixture-simple-jsx'
import Log from './fixture-props-jsx'
import Parent from './fixture-children-jsx'

const htmlHelloString = `<p>Hello</p>`
const pugHelloString = `p Hello\n`
const htmlLogTemplate = (text, link) => `<a href="${link}">${text}</a>`
const pugLogTemplate = (text, link) => `a(href=\'${link}\') ${text}\n`
const pugParentTemplate = (text, children) => `article\n  h1 ${text}\n  ${children}`

test(`jsx.toHTML converts a jsx component into html`, (t) => {
  t.plan(3)
  t.equal(typeof jsx.toHTML, `function`)
  const output = jsx.toHTML({}, Hello)
  t.equal(output, htmlHelloString)
  const text = random.word(10)
  const output2 = jsx.toHTML({text, href: `place.com`}, Log)
  t.equal(output2, htmlLogTemplate(text, `place.com`))
  t.end()
})
test(`jsx.toHTMLTask converts a jsx component into Task(html)`, (t) => {
  t.plan(3)
  t.equal(typeof jsx.toHTMLTask, `function`)
  const output = jsx.toHTMLTask({}, Hello)
  output.fork(id, (x) => {
    t.equal(x, htmlHelloString)
  })
  const text = random.word(10)
  const href = random.word(10)
  jsx.toHTMLTask({text, href}, Log).fork(id, (output2) => {
    t.equal(output2, htmlLogTemplate(text, href))
    t.end()
  })
})
test(`jsx.unwrapDefault should return .default when given a non-function`, (t) => {
  t.plan(3)
  t.equal(typeof unwrapDefault, `function`)
  unwrapDefault({}).fork((e) => {
    t.equal(e.message, `Received something which is likely not a jsx module.`)
  }, id)
  const num = random.floorMin(1, 1e3)
  const fn = () => num
  unwrapDefault(fn).fork(id, (valueFn) => {
    t.equal(valueFn(), num)
    t.end()
  })
})

const testPug = curry((deprecated, t) => {
  const method = deprecated ? `toJade` : `toPug`
  t.plan(4)
  t.equal(typeof jsx[method], `function`)
  const word = random.word(10)
  const href = random.word(10)
  const propLessTask = jsx[method]({}, Hello)
  const thrower = (e) => { throw e }
  propLessTask.fork(
    thrower,
    (output) => {
      t.equal(output, pugHelloString)
    }
  )
  const taskWithProps = jsx[method]({text: word, href}, Log)
  taskWithProps.fork(
    thrower,
    (output) => {
      t.equal(output, pugLogTemplate(word, href))
    }
  )
  const taskWithKids = jsx[method]({text: word, children: [Hello]}, Parent)
  taskWithKids.fork(
    thrower,
    (output) => {
      t.equal(output, pugParentTemplate(word, pugHelloString))
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

test(`file.toHTML should convert a filename into HTML`, (t) => {
  t.plan(3)
  t.equal(typeof file.toHTML, `function`)
  const task = file.toHTML({}, `${__dirname}/fixture-simple-jsx.js`)
  task.fork(id, (out) => {
    t.equal(out, htmlHelloString)
  })
  const text = random.word(10)
  const href = random.word(10)
  const task2 = file.toHTML({text, href}, `${__dirname}/fixture-props-jsx.js`)
  task2.fork(id, (out) => {
    t.equal(out, htmlLogTemplate(text, href))
    t.end()
  })
})

test(`file.toPug should convert a filename into pug`, (t) => {
  t.plan(3)
  t.equal(typeof file.toPug, `function`)
  const task = file.toPug({}, `${__dirname}/fixture-simple-jsx.js`)
  task.fork(id, (out) => {
    t.equal(pugHelloString, out)
  })
  const text = random.word(10)
  const href = random.word(10)
  const task2 = file.toPug({text, href}, `${__dirname}/fixture-props-jsx.js`)
  task2.fork(id, (out) => {
    t.equal(out, pugLogTemplate(text, href))
    t.end()
  })
})
