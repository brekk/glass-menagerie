import path from 'path'
// import Promise from 'bluebird'
import register from 'babel-core/register'
register()
import test from 'ava'
// import id from 'lodash/fp/identity'
import _debug from 'debug'
import {taskToPromise} from 'f-utility/core/task'
import random from 'f-utility/testing/random'
import {
  readJSONOrYAML,
  isValidFileName,
  glassMenagerie,
  mock,
  autoMock,
  makePugKeyValues
} from '../src/glass-menagerie'
const debug = _debug(`glass-menagerie:tests:main`)

import {propTypes} from './fixtures/fixture-blog-post-jsx'

const pugBlog = [
  `.blog-post`,
  `  h1 `,
  `  strong `,
  `  p `
]
const relativize = (x) => path.resolve(__dirname, x)
const files = {
  json: relativize(`./fixtures/fixture-props.json`),
  yaml: relativize(`./fixtures/fixture-props.yml`),
  jsx: relativize(`./fixtures/fixture-props-jsx.js`),
  blog: relativize(`./fixtures/fixture-blog-post-jsx.js`),
  missingProps: relativize(`./fixtures/fixture-no-proptypes-jsx.js`)
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

const compareOutputToMockOutput = (result) => {
  const [root, h1, strong, p] = result.split(`\n`)
  const [expectedRoot, expectedH1, expectedStrong, expectedP] = pugBlog
  return {
    is: [root, expectedRoot],
    truthy: [
      h1.indexOf(expectedH1) > -1,
      strong.indexOf(expectedStrong) > -1,
      p.indexOf(expectedP) > -1
    ]
  }
}

test(
  `mock should be able to generate a props object given a propTypes object`,
  async (t) => {
    t.plan(5)
    t.is(typeof mock, `function`)
    const out = await taskToPromise(mock(propTypes, files.blog))
    const {is, truthy} = compareOutputToMockOutput(out)
    const [h1, strong, p] = truthy
    t.is(...is)
    t.truthy(h1)
    t.truthy(strong)
    t.truthy(p)
  }
)

test(
  `autoMock should be able to read a file for an exported propTypes object`,
  async (t) => {
    t.plan(6)
    t.is(typeof autoMock, `function`)
    t.is(typeof autoMock(true), `function`)
    const output = await autoMock(false, files.blog)
    const {is, truthy} = compareOutputToMockOutput(output)
    const [h1, strong, p] = truthy
    t.is(...is)
    t.truthy(h1)
    t.truthy(strong)
    t.truthy(p)
  }
)
test(
  [
    `autoMock should fail when given a file which doesn't`,
    `export propTypes explicitly and allowError is set to false`
  ].join(` `),
  (t) => {
    t.plan(1)
    t.throws(
      autoMock(false, files.missingProps),
      `Expected to be able to find propTypes as an \`export\`-ed value at ${files.missingProps}.`
    )
  }
)
test(
  [
    `autoMock should not fail when given a file which doesn't`,
    `export propTypes explicitly and allowError is set to true`
  ].join(` `),
  (t) => {
    t.plan(1)
    t.notThrows(
      autoMock(true, files.missingProps)
    )
  }
)
test(
  `makePugKeyValues should operate on a [key, value] with some configuration`, (t) => {
    t.plan(8)
    t.is(typeof makePugKeyValues, `function`)
    const args = [{output: `./tmp/`}, relativize, [files.blog, random.word(10)]]
    t.throws(
      () => makePugKeyValues({}, args[1], args[2]),
      `Expected to be able to access config.output`
    )
    t.throws(
      () => makePugKeyValues(args[0], null, args[2]),
      `Expected to receive relativize function.`
    )
    t.throws(
      () => makePugKeyValues(args[0], args[1], null),
      `Expected to receive [key, value] pair.`
    )
    const out = makePugKeyValues(...args)
    debug(`out`, out)
    const parsed = path.parse(files.blog)
    const name = parsed.name
    const {dir} = path.parse(relativize(args[0].output))
    const matchPath = path.resolve(dir + `/`, args[0].output, name + `.pug`)
    const [key, value] = out
    t.is(key, files.blog)
    t.is(value.path, matchPath)
    t.is(value.raw, args[2][1])
    const expected = [
      `//- ${args[2][0]}`,
      `//- autogenerated by glass, to recreate, run:`,
      `//- glass -f ${args[2][0]}`,
      `${args[2][1]}`
    ].join(`\n`)
    t.is(value.altered, expected)
  }
)
test(
  `makePugKeyValues should throw when given a bad file as a key`,
  (t) => {
    t.plan(1)
    t.throws(
      () => makePugKeyValues({output: `./tmp/`}, relativize, [null, random.word(10)]),
      `Unable to read path of non-string.`
    )
  }
)
