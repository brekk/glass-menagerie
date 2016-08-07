import test from 'tape'
import random from '../harness/random'
import {isType, isValid, splitters} from '../../src/util/validators'

import id from 'lodash/fp/identity'
import keys from 'lodash/fp/keys'
import curry from 'lodash/fp/curry'
import flow from 'lodash/fp/flow'
import without from 'lodash/fp/without'
import compact from 'lodash/fp/compact'

import Validation from 'data.validation'

const inputs = {
  string: () => random.word(10),
  number: () => random.floorMin(1, 1e5),
  object: () => ({}),
  fn: () => () => ({}),
  array: () => ([]),
  boolean: () => !!((Math.random() * 1) > 0.5)
}
const getInvalid = curry((obj, toOmit) => {
  const keyRemover = without([toOmit])
  const findValidTest = flow(
    keys,
    random.shuffle,
    keyRemover,
    compact,
    // arrays and objects ain't typeof safe, so we remove additional
    toOmit === `object` ? without([`array`]) : id,
    toOmit === `array` ? without([`object`]) : id
  )
  const method = findValidTest(obj)[0]
  return obj[method]
})
const getInvalidInput = getInvalid(inputs)

test(`isType.string should be a type assertion method`, (assert) => {
  assert.plan(7)
  assert.equal(typeof isType, `object`)
  assert.equal(typeof isType.string, `function`)
  assert.ok(isType.string(``))
  assert.notOk(isType.string(null))
  assert.notOk(isType.string(1))
  assert.notOk(isType.string(false))
  assert.notOk(isType.string({}))
  assert.end()
})
test(`isType.number should be a type assertion method`, (assert) => {
  assert.plan(5)
  assert.equal(typeof isType.number, `function`)
  assert.ok(isType.number(1))
  assert.notOk(isType.number(null))
  assert.notOk(isType.number({}))
  assert.notOk(isType.number(false))
  assert.end()
})
test(`isType.object should be a type assertion method`, (assert) => {
  assert.plan(5)
  assert.equal(typeof isType.object, `function`)
  assert.ok(isType.object({}))
  assert.ok(isType.object(null))
  assert.notOk(isType.object(1))
  assert.notOk(isType.object(false))
  assert.end()
})
test(`isType.boolean should be a type assertion method`, (assert) => {
  assert.plan(6)
  assert.equal(typeof isType.boolean, `function`)
  assert.ok(isType.boolean(true))
  assert.ok(isType.boolean(false))
  assert.notOk(isType.boolean(null))
  assert.notOk(isType.boolean({}))
  assert.notOk(isType.boolean(-222))
  assert.end()
})
test(`isType.fn should be a type assertion method`, (assert) => {
  assert.plan(5)
  assert.equal(typeof isType.fn, `function`)
  const noop = () => null
  assert.ok(isType.fn(noop))
  assert.notOk(isType.fn(null))
  assert.notOk(isType.fn({}))
  assert.notOk(isType.fn(-222))
  assert.end()
})
test(`isType.array should be a type assertion method`, (assert) => {
  assert.plan(6)
  assert.equal(typeof isType.array, `function`)
  assert.ok(isType.array([]))
  assert.notOk(isType.array(null))
  assert.notOk(isType.array({}))
  assert.notOk(isType.array(-222))
  assert.notOk(isType.array(false))
  assert.end()
})

test(`isValid should be an object whose methods are null-safe type assertions`, (assert) => {
  assert.plan(6)
  assert.equal(typeof isValid, `object`)
  assert.equal(typeof isValid.string, `function`)
  assert.equal(typeof isValid.number, `function`)
  assert.equal(typeof isValid.object, `function`)
  assert.equal(typeof isValid.fn, `function`)
  assert.equal(typeof isValid.array, `function`)
  assert.end()
})

const testMethod = curry((methodName, assert) => {
  // const isntArray = methodName !== `array`
  const method = isValid[methodName]
  const failee = getInvalidInput(methodName)()
  const failureObj = method(failee)
  assert.plan(7)
  assert.ok(failureObj)
  assert.ok(failureObj.isFailure)
  assert.ok(failureObj.value)
  assert.same(failureObj.value, [`Expected typeof thing to equal '${methodName}'.`])
  const value = inputs[methodName]
  const rawValue = value()
  const successObj = method(rawValue)
  assert.ok(successObj)
  assert.notOk(successObj.isFailure)
  assert.same(successObj.value, rawValue)
  assert.end()
})
test(`isValid.object should test objects`, testMethod(`object`))
test(`isValid.number should test numbers`, testMethod(`number`))
test(`isValid.boolean should test booleans`, testMethod(`boolean`))
test(`isValid.fn should test functions`, testMethod(`fn`))
test(`isValid.array should test arrays`, testMethod(`array`))


test(`splitters should be function which expects a boolean and returns an object`, (assert) => {
  assert.plan(6)
  assert.equal(typeof splitters, `function`)
  const output = splitters(true)
  assert.equal(typeof output.string, `function`)
  assert.equal(typeof output.number, `function`)
  assert.equal(typeof output.object, `function`)
  assert.equal(typeof output.fn, `function`)
  assert.equal(typeof output.array, `function`)
  assert.end()
})

const assertAboutSplitter = curry((asIndicies, methodName, assert) => {
  const splitterObject = splitters(asIndicies)
  const method = splitterObject[methodName]
  const failee = getInvalidInput(methodName)()
  const valid = inputs[methodName]
  const output = method([valid, failee])
  assert.plan(1)
  assert.ok(output)
  assert.end()
})

test(`isValidSplitter.object should validate a list of objects as indices`,
  assertAboutSplitter(true, `object`)
)
test(`isValidSplitter.object should validate a list of objects`,
  assertAboutSplitter(false, `object`)
)
test(`isValidSplitter.number should validate a list of numbers as indices`,
  assertAboutSplitter(true, `number`)
)
test(`isValidSplitter.number should validate a list of numbers`,
  assertAboutSplitter(false, `number`)
)
test(`isValidSplitter.boolean should validate a list of booleans as indices`,
  assertAboutSplitter(true, `boolean`)
)
test(`isValidSplitter.boolean should validate a list of booleans`,
  assertAboutSplitter(false, `boolean`)
)
test(`isValidSplitter.fn should validate a list of functions as indices`,
  assertAboutSplitter(true, `fn`)
)
test(`isValidSplitter.fn should validate a list of functions`,
  assertAboutSplitter(false, `fn`)
)
test(`isValidSplitter.array should validate a list of arrays as indices`,
  assertAboutSplitter(true, `array`)
)
test(`isValidSplitter.array should validate a list of arrays`,
  assertAboutSplitter(false, `array`)
)
