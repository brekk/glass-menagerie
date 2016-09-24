// import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'
import test from 'ava'
import {taskToPromise} from 'f-utility/core/task'
import {
  readJSONOrYAML,
  isValidFileName,
  glassMenagerie
} from '../src/glass-menagerie'
import {propTypes} from './fixtures/fixture-blog-post-jsx'
const files = {
  json: path.resolve(__dirname, `./fixtures/fixture-props.json`),
  yaml: path.resolve(__dirname, `./fixtures/fixture-props.yml`),
  jsx: path.resolve(__dirname, `./fixtures/fixture-props-jsx.js`),
  blog: path.resolve(__dirname, `./fixtures/fixture-blog-post-jsx.js`)
}
test(`readJSONOrYAML should be able to read json or yaml files`, (t) => {
  t.plan(3)
  t.is(typeof readJSONOrYAML, `function`)
  const jsonOut = readJSONOrYAML(files.json)
  const yamlOut = readJSONOrYAML(files.yaml)
  const raw = {
    text: `hey`,
    href: `http://website.com`
  }
  t.deepEqual(jsonOut, raw)
  t.deepEqual(yamlOut, raw)
})

test(`isValidFileName should validate whether a given value has an extname`, (t) => {
  t.plan(5)
  t.is(typeof isValidFileName, `function`)
  t.is(isValidFileName(`test cool science`), false)
  const matching = isValidFileName(`../somekind/of/file.path`)
  t.is(matching, true)
  t.is(isValidFileName(`text: 'hey'\nhref: 'http://website.com'`), false)
  t.is(isValidFileName({}), false)
})

test(`glassMenagerie should expect an object/string/file and a jsxFile`, async (t) => {
  t.plan(4)
  t.is(typeof glassMenagerie, `function`)
  const task = glassMenagerie(files.yaml, files.jsx)
  t.is(typeof task.fork, `function`)
  const raw = `a(href=\'http://website.com\') hey\n`
  const one = await taskToPromise(task)
  t.is(one, raw)
  const task2 = glassMenagerie(`text: 'hey'\nhref: 'http://website.com'`, files.jsx)
  const two = await taskToPromise(task2)
  t.is(two, raw)
})

test(
  `glassMenagerie.mock should be able to generate a props object given a propTypes object`,
  async (t) => {
    t.plan(5)
    const pugBlog = [
      `.blog-post`,
      `  h1 `,
      `  strong `,
      `  p `
    ]
    const [expectedRoot, expectedH1, expectedStrong, expectedP] = pugBlog
    t.is(typeof glassMenagerie.mock, `function`)
    const out = await taskToPromise(glassMenagerie.mock(propTypes, files.blog))
    const [root, h1, strong, p] = out.split(`\n`)
    t.is(root, expectedRoot)
    t.truthy(h1.indexOf(expectedH1) > -1)
    t.truthy(strong.indexOf(expectedStrong) > -1)
    t.truthy(p.indexOf(expectedP) > -1)
  }
)
