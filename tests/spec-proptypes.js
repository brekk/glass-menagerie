import path from 'path'
import React from 'react'
const {PropTypes: types} = React
import test from 'ava'
import identity from 'lodash/fp/identity'
// import {taskToPromise} from 'f-utility/core/task'
// import {jsx} from '../src/jsx-to-pug'
// import {shallow} from 'enzyme'
// import curry from 'lodash/fp/curry'
// import forEach from 'lodash/fp/forEach'
import {
  is,
  inferPropType,
  inferPropTypeObject,
  genericPropTypeLookup,
  convertSimplePropTypes,
  createMock,
  requireWithPropTypes
} from '../src/proptypes'

test(`matchPropTypes must match a given propType by name`, (t) => {
  // t.plan(enumerables.length + 2)
  t.plan(3)
  // expect(is).to.be.an.object()
  t.is(typeof is, `object`)
  t.truthy(is.array(types.array))
  t.falsy(is.array(types.object))
})
test(`genericPropTypeLookup must barf when given invalid lookups`, (t) => {
  t.plan(1)
  const thrower = () => genericPropTypeLookup(types, false, `x`, types.array)
  t.throws(thrower)
})
test(
  `inferPropType must be a function which infers the correct type from a given function`,
  (t) => {
    t.plan(25)
    t.is(typeof inferPropType, `function`)
    // expect(inferPropType).to.be.a.function()
    // expect(inferPropType(types.array.isRequired)).to.equal(`arrayRequired`)
    t.is(inferPropType(types.array), `array`)
    t.is(inferPropType(types.bool), `bool`)
    t.is(inferPropType(types.func), `func`)
    t.is(inferPropType(types.number), `number`)
    t.is(inferPropType(types.object), `object`)
    t.is(inferPropType(types.string), `string`)
    t.is(inferPropType(types.any), `any`)
    t.is(inferPropType(types.element), `element`)
    t.is(inferPropType(types.node), `node`)
    // required
    t.is(inferPropType(types.array.isRequired), `requiredArray`)
    t.is(inferPropType(types.bool.isRequired), `requiredBool`)
    t.is(inferPropType(types.func.isRequired), `requiredFunc`)
    t.is(inferPropType(types.number.isRequired), `requiredNumber`)
    t.is(inferPropType(types.object.isRequired), `requiredObject`)
    t.is(inferPropType(types.string.isRequired), `requiredString`)
    t.is(inferPropType(types.any.isRequired), `requiredAny`)
    t.is(inferPropType(types.element.isRequired), `requiredElement`)
    t.is(inferPropType(types.node.isRequired), `requiredNode`)
    // non isRequired-able
    t.is(inferPropType(types.instanceOf), `instanceOf`)
    t.is(inferPropType(types.arrayOf), `arrayOf`)
    t.is(inferPropType(types.objectOf), `objectOf`)
    t.is(inferPropType(types.oneOf), `oneOf`)
    t.is(inferPropType(types.oneOfType), `oneOfType`)
    t.is(inferPropType(types.shape), `shape`)
  }
)
test(`inferPropType must return false when given an invalid function`, (t) => {
  t.plan(1)
  t.falsy(inferPropType(() => {}))
})
test(
  `inferPropTypeObject must accurately convert a given propTypeObject into a dictionary`,
  (t) => {
    t.plan(1)
    const input = {
      a: types.array,
      b: types.bool,
      c: types.number,
      d: types.array.isRequired,
      e: types.bool.isRequired,
      f: types.number.isRequired
    }
    const output = inferPropTypeObject(input)
    t.deepEqual(output, {
      a: `array`,
      b: `bool`,
      c: `number`,
      d: `requiredArray`,
      e: `requiredBool`,
      f: `requiredNumber`
    })
  }
)
test(
  `inferPropTypeObject must fail to convert non-accurate functions`,
  (t) => {
    t.plan(1)
    const input = {
      a: types.array,
      b: types.bool,
      c: types.number,
      d: () => {}
    }
    const output = inferPropTypeObject(input)
    t.deepEqual(output, {
      a: `array`,
      b: `bool`,
      c: `number`
    })
  }
)
test(
  `convertSimplePropTypes should convert a given input into a matching`, (t) => {
    t.plan(19)
    t.is(typeof convertSimplePropTypes, `function`)
    t.deepEqual(convertSimplePropTypes(`func`), identity)
    t.deepEqual(convertSimplePropTypes(`requiredFunc`), identity)
    t.true(Array.isArray(convertSimplePropTypes(`array`)))
    t.deepEqual(convertSimplePropTypes(`requiredFunc`), identity)
    t.truthy(convertSimplePropTypes(`bool`))
    t.truthy(convertSimplePropTypes(`requiredBool`))
    t.deepEqual(convertSimplePropTypes(`object`), {})
    t.deepEqual(convertSimplePropTypes(`requiredObject`), {})
    t.deepEqual(convertSimplePropTypes(`any`), {})
    t.deepEqual(convertSimplePropTypes(`requiredAny`), {})
    t.is(typeof convertSimplePropTypes(`string`), `string`)
    t.is(typeof convertSimplePropTypes(`requiredString`), `string`)
    t.is(typeof convertSimplePropTypes(`number`), `number`)
    t.is(typeof convertSimplePropTypes(`requiredNumber`), `number`)
    const span = (<span />)
    t.deepEqual(convertSimplePropTypes(`node`), span)
    t.deepEqual(convertSimplePropTypes(`requiredNode`), span)
    t.deepEqual(convertSimplePropTypes(`element`), span)
    t.deepEqual(convertSimplePropTypes(`requiredElement`), span)
  }
)
test(`createMock should do convertSimplePropTypes in aggregate`, (t) => {
  t.plan(4)
  t.is(typeof createMock, `function`)
  const mock = createMock({a: types.bool, b: types.number, c: types.string})
  t.true(mock.a)
  t.is(typeof mock.b, `number`)
  t.is(typeof mock.c, `string`)
})
test(`requireWithPropTypes should optionally throw on files missing an exported propType`,
  (t) => {
    t.plan(2)
    t.is(typeof requireWithPropTypes, `function`)
    const filename = path.resolve(__dirname, `./fixtures/fixture-no-proptypes-jsx.js`)
    return requireWithPropTypes(
      false,
      filename
    ).catch((e) => {
      t.is(
        e.toString(),
        `TypeError: Expected to be able to find propTypes as an \`export\`-ed value at ${filename}.`
      )
    })
  }
)
