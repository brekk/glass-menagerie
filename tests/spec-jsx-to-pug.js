import path from 'path'
import test from 'ava'
import id from 'lodash/fp/identity'
import curry from 'lodash/fp/curry'

import random from 'f-utility/testing/random'
// import trace from '../../src/trace'
import {
  jsx,
  htmlToPug,
  file,
  unwrapDefault
} from '../src/jsx-to-pug'

import Hello from './fixtures/fixture-simple-jsx'
import Log from './fixtures/fixture-props-jsx'
import Parent from './fixtures/fixture-children-jsx'

const htmlHelloString = `<p>Hello</p>`
const pugHelloString = `p Hello\n`
const htmlLogTemplate = (text, link) => `<a href="${link}">${text}</a>`
const pugLogTemplate = (text, link) => `a(href=\'${link}\') ${text}\n`
const pugParentTemplate = (text, children) => `article\n  h1 ${text}\n  ${children}`

test(`jsx.toHTML converts a jsx component into html`, (t) => {
  t.plan(3)
  t.is(typeof jsx.toHTML, `function`)
  const output = jsx.toHTML({}, Hello)
  t.is(output, htmlHelloString)
  const text = random.word(10)
  const output2 = jsx.toHTML({text, href: `place.com`}, Log)
  t.is(output2, htmlLogTemplate(text, `place.com`))
})
test.cb(`jsx.toHTMLTask converts a jsx component into Task(html)`, (t) => {
  t.plan(3)
  t.is(typeof jsx.toHTMLTask, `function`)
  const output = jsx.toHTMLTask({}, Hello)
  output.fork(id, (x) => {
    t.is(x, htmlHelloString)
  })
  const text = random.word(10)
  const href = random.word(10)
  jsx.toHTMLTask({text, href}, Log).fork(id, (output2) => {
    t.is(output2, htmlLogTemplate(text, href))
    t.end()
  })
})
test.cb(`jsx.unwrapDefault should return .default when given a non-function`, (t) => {
  t.plan(3)
  t.is(typeof unwrapDefault, `function`)
  unwrapDefault({}).fork((e) => {
    t.is(e.message, `Received something which is likely not a jsx module.`)
  }, id)
  const num = random.floorMin(1, 1e3)
  const fn = () => num
  unwrapDefault(fn).fork(id, (valueFn) => {
    t.is(valueFn(), num)
    t.end()
  })
})

const testPug = curry((deprecated, t) => {
  const method = deprecated ? `toJade` : `toPug`
  t.plan(4)
  t.is(typeof jsx[method], `function`)
  const word = random.word(10)
  const href = random.word(10)
  const propLessTask = jsx[method]({}, Hello)
  const thrower = (e) => { throw e }
  propLessTask.fork(
    thrower,
    (output) => {
      t.is(output, pugHelloString)
    }
  )
  const taskWithProps = jsx[method]({text: word, href}, Log)
  taskWithProps.fork(
    thrower,
    (output) => {
      t.is(output, pugLogTemplate(word, href))
    }
  )
  const taskWithKids = jsx[method]({text: word, children: [Hello]}, Parent)
  taskWithKids.fork(
    thrower,
    (output) => {
      t.is(output, pugParentTemplate(word, pugHelloString))
    }
  )
})

test(`jsx.toPug converts a jsx component into jade / pug`, testPug(false))
test(`jsx.toJade converts a jsx component into jade / pug while whining`, testPug(true))

test(`jsx.htmlToPug should fail when given html which ain't a string`, (t) => {
  t.plan(2)
  t.is(typeof htmlToPug, `function`)
  const outputTask = htmlToPug(false)
  outputTask.fork((e) => {
    t.is(e.message, `Expected to be given html string.`)
  }, id)
})

test(`file.toHTML should convert a filename into HTML`, (t) => {
  t.plan(3)
  t.is(typeof file.toHTML, `function`)
  const task = file.toHTML({}, path.resolve(__dirname, `./fixtures/fixture-simple-jsx.js`))
  task.fork(id, (out) => {
    t.is(out, htmlHelloString)
  })
  const text = random.word(10)
  const href = random.word(10)
  const task2 = file.toHTML(
    {text, href},
    path.resolve(__dirname, `./fixtures/fixture-props-jsx.js`)
  )
  task2.fork(id, (out) => {
    t.is(out, htmlLogTemplate(text, href))
  })
})

test(`file.toPug should convert a filename into pug`, (t) => {
  t.plan(3)
  t.is(typeof file.toPug, `function`)
  const task = file.toPug({}, path.resolve(__dirname, `./fixtures/fixture-simple-jsx.js`))
  task.fork(id, (out) => {
    t.is(pugHelloString, out)
  })
  const text = random.word(10)
  const href = random.word(10)
  const task2 = file.toPug(
    {text, href},
    path.resolve(__dirname, `./fixtures/fixture-props-jsx.js`)
  )
  task2.fork(id, (out) => {
    t.is(out, pugLogTemplate(text, href))
  })
})
