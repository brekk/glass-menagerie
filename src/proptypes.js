import React from 'react'
import curry from 'lodash/fp/curry'
import clone from 'lodash/fp/cloneDeep'
import memoize from 'lodash/fp/memoize'
import identity from 'lodash/fp/identity'
import flow from 'lodash/fp/flow'
import compact from 'lodash/fp/compact'
import reduce from 'lodash/fp/reduce'
import merge from 'lodash/fp/merge'
import toPairs from 'lodash/fp/toPairs'
import map from 'lodash/fp/map'
import {mergePairs} from 'f-utility/fp/merge-pairs'
import random from 'f-utility/testing/random'
import {debug as makeDebugger} from 'f-utility/dev/debug'

const LIBRARY = `glass-menagerie`
const _debug = makeDebugger(LIBRARY)
const debug = {
  genericPropTypeLookup: _debug([`proptypes`, `genericPropTypeLookup`]),
  compareFnToKeyPair: _debug([`proptypes`, `compareFnToKeyPair`]),
  alterKV: _debug([`proptypes`, `alterKV`]),
  alterRequiredKeys: _debug([`proptypes`, `alterRequiredKeys`]),
  inferPropTypeObject: _debug([`proptypes`, `inferPropTypeObject`]),
  genericInferPropType: _debug([`proptypes`, `genericInferPropType`]),
  convertSimplePropTypes: _debug([`proptypes`, `convertSimplePropTypes`])
}

export const {PropTypes: types} = React

export const genericPropTypeLookup = curry(function _propTypeLookup(
  givenTypes, isRequired, lookup, x
) {
  if (!givenTypes[lookup] || (isRequired && !givenTypes[lookup].isRequired)) {
    throw new TypeError(`Expected to be given valid propType method. (${lookup})`)
  }
  const match = isRequired ? givenTypes[lookup].isRequired : givenTypes[lookup]
  return x === match
})

// we export the generic for easier testing, but in almost all other cases
// we wanna preload the lookup with React.PropTypes
export const isRequiredPropType = genericPropTypeLookup(types, true)
// throw this on the function so our devs don't have to look it up by hand later
isRequiredPropType.types = types
export const isPropType = genericPropTypeLookup(types, false)
isPropType.types = types

export const compareFnToKeyPair = curry(function _compareFnToKeyPair(toCompare, keyPair) {
  const [key, typeFn] = keyPair
  if (typeof toCompare === `function`) {
    const matches = typeFn(toCompare)
    if (matches) {
      return key
    }
  }
  return toCompare
})

const alterKV = curry((alterKey, alterValue, pair) => {
  // if (!pair || !pair[0] || !pair[1]) {
  //   return null
  // }
  const [key, value] = pair
  return {[alterKey(key)]: alterValue(value)}
})

const capitalize = memoize((str) => (str[0].toUpperCase() + str.slice(1)))

export const alterRequiredKeys = (inputObject) => {
  const consume = flow(
    (x) => x.required,
    toPairs,
    map(alterKV((k) => `required${capitalize(k)}`, identity)),
    compact,
    reduce(merge, {})
  )
  const copy = clone(inputObject)
  const consumed = consume(copy)
  delete copy.required
  return {
    ...consumed,
    ...copy
  }
}

export const is = {
  required: {
    array: isRequiredPropType(`array`),
    bool: isRequiredPropType(`bool`),
    func: isRequiredPropType(`func`),
    number: isRequiredPropType(`number`),
    object: isRequiredPropType(`object`),
    string: isRequiredPropType(`string`),
    any: isRequiredPropType(`any`),
    element: isRequiredPropType(`element`),
    node: isRequiredPropType(`node`)
  },
  // unrequired
  array: isPropType(`array`),
  bool: isPropType(`bool`),
  func: isPropType(`func`),
  number: isPropType(`number`),
  object: isPropType(`object`),
  string: isPropType(`string`),
  any: isPropType(`any`),
  element: isPropType(`element`),
  node: isPropType(`node`),
  // functions, unrequited
  instanceOf: isPropType(`instanceOf`),
  arrayOf: isPropType(`arrayOf`),
  objectOf: isPropType(`objectOf`),
  oneOf: isPropType(`oneOf`),
  oneOfType: isPropType(`oneOfType`),
  shape: isPropType(`shape`)
}

const resolveWhenNotAFunction = (x) => {
  if (typeof x === `function`) {
    return false
  }
  return x
}

export const genericInferPropType = curry(function _inferPropType(dataStructure, fnToMatch) {
  const inferenceFunction = flow(
    alterRequiredKeys,
    toPairs,
    reduce(compareFnToKeyPair, fnToMatch),
    resolveWhenNotAFunction
  )
  return inferenceFunction(dataStructure)
})

export const inferPropType = genericInferPropType(is)

export const inferPropTypeObject = flow(
  toPairs,
  map(flow(
    ([k, v]) => ([k, inferPropType(v)]),
    (pair) => {
      return (pair && pair[0] && pair[1]) ?
        {[pair[0]]: pair[1]} :
        null
    }
  )),
  compact,
  reduce(merge, {})
)

export const convertSimplePropTypes = (y) => {
  const match = `required`
  const reqIndex = y.indexOf(match)
  const x = reqIndex > -1 ?
    y.slice(match.length).toLowerCase() :
    y
  debug.convertSimplePropTypes(`reqIndex`, `council of thirteen`, x, reqIndex)
  if (x === `object` || x === `any`) {
    return {}
  } else if (x === `bool`) {
    return true
  } else if (x === `string`) {
    return random.word(10)
  } else if (x === `number`) {
    return random.floorMin(1, 1e3)
  } else if (x === `array`) {
    return random.word(10).split(``)
  } else if (x === `func`) {
    return identity
  } else if (x === `node` || x === `element`) {
    return (<span />)
  }
}

export const createMock = (typesObject) => {
  return flow(
    inferPropTypeObject,
    toPairs,
    map(([k, v]) => ([k, convertSimplePropTypes(v)])),
    mergePairs
  )(typesObject)
}
