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

export const isType = reduce((struct, x) => {
  const newStruct = {...struct}
  newStruct[x] = ofType(x)
  return newStruct
}, {}, [
  `string`,
  `number`,
  `object`,
  `boolean`,
  `array`
])

isType.fn = ofType(`function`)
// isType.array = Array.isArray

const types = [
  `string`,
  `number`,
  `object`,
  `fn`,
  `array`,
  `boolean`
]

export const isValid = reduce((oldTypes, type) => {
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
}, {}, types)

const isValidReducer = curry((pullValue, list, structure, item) => {
  const copy = cloneDeep(structure)
  const getValue = (x) => list[x]
  const output = pullValue ? getValue(copy.index) : copy.index
  // const output = getValue(copy.index)
  if (item.isFailure) {
    copy.failures = structure.failures.concat(output)
  } else {
    copy.successes = structure.successes.concat(output)
  }
  copy.index = structure.index + 1
  return copy
})

export const isValidSplitter = curry(function curriedValidator(asIndexes, validator, list) {
  const initialState = {failures: [], successes: [], index: 0}
  const splitter = flow(
    map(validator),
    reduce(isValidReducer(asIndexes, list), initialState)
  )
  const split = splitter(list)
  delete split.index
  return split
})

export const splitters = (asIndexes) => {
  return reduce((oldTypes, type) => {
    const newTypes = {...oldTypes}
    newTypes[type] = isValidSplitter(asIndexes, isValid[type])
    return newTypes
  }, {}, types)
}

export const splitValidListAsIndex = splitters(true)
export const splitValidList = splitters(false)

export default isValid
