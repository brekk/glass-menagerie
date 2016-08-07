import curry from 'lodash/fp/curry'
import reduce from 'lodash/fp/reduce'
import cloneDeep from 'lodash/fp/cloneDeep'
import flow from 'lodash/fp/flow'
import map from 'lodash/fp/map'

import Validation from 'data.validation'
const {Failure, Success} = Validation

export const ofType = curry(function curriedTypeOf(type, thing) {
  if (type === `array`) {
    return thing && typeof thing === `object` && Array.isArray(thing)
  }
  return (typeof thing === type) && (typeof thing !== `undefined`)
})

const isTypeReducer = (struct, x) => {
  const newStruct = {...struct}
  newStruct[x] = ofType(x)
  return newStruct
}

const mostTypes = [
  `string`,
  `number`,
  `object`,
  `boolean`,
  `array`
]

export const isType = reduce(isTypeReducer, {}, mostTypes)

// `function` is a reserved word
isType.fn = ofType(`function`)

const types = [
  ...mostTypes,
  `fn`
]

const internalValidReducer = (oldTypes, type) => {
  const newTypes = {...oldTypes}
  newTypes[type] = (thing) => {
    const match = isType[type](thing)
    if (!match) {
      // throw new TypeError(`Expected thing to be a ${toCheck}.`)
      return Failure([`Expected typeof thing to equal '${type}'.`])
    }
    return Success(thing)
  }
  return newTypes
}

export const isValid = reduce(internalValidReducer, {}, types)

const addValueToFailureOrSuccess = (container, isFailure, output) => {
  const copy = cloneDeep(container)
  const key = isFailure ? `successes` : `failures`
  if (isFailure) {
    copy[key] = copy[key].concat(output)
  }
  return copy
}

export const getOrPullValue = (pullData, puller, value) => {
  return pullData ? puller(value) : value
}

export const isValidReducer = curry((pullValue, list, structure, item) => {
  const getValue = (x) => list[x]
  const output = getOrPullValue(pullValue, getValue, structure.index)
  // const output = getValue(copy.index)
  const copy = addValueToFailureOrSuccess(structure, item.isFailure, output)
  copy.index = structure.index + 1
  return copy
})

export const pullFailuresAndSuccesses = ({failures, successes}) => ({failures, successes})

export const isValidSplitter = curry(function curriedValidator(asIndexes, validator, list) {
  const initialState = {failures: [], successes: [], index: 0}
  const splitter = flow(
    map(validator),
    reduce(isValidReducer(asIndexes, list), initialState),
    pullFailuresAndSuccesses
  )
  const split = splitter(list)
  return split
})

const splitterReducer = curry(function curriedSplittingReducer(asIndexes, oldTypes, type) {
  const newTypes = cloneDeep(oldTypes)
  newTypes[type] = isValidSplitter(asIndexes, isValid[type])
  return newTypes
})

export const splitters = (asIndexes) => {
  return reduce(splitterReducer(asIndexes), {}, types)
}

export const splitValidListAsIndex = splitters(true)
export const splitValidList = splitters(false)

export default isValid
