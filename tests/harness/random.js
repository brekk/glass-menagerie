import curry from 'lodash/fp/curry'
import rangeFinder from 'lodash/fp/range'
import map from 'lodash/fp/map'
import flow from 'lodash/fp/flow'
import reduce from 'lodash/fp/reduce'
import merge from 'lodash/fp/merge'
import {join} from '../../lib/util/array'
import {isType} from '../../lib/util/validators'
// import {trace} from '../app/js/utils/functional-patterns'

export const alphabet = `abcdefghijklmnopqrstuvwxyz`.split(``)

export const random = (x) => Math.round(Math.random() * x)

// const cheapImpureShuffle = curry((newList, card) => {
//   if ((Math.random() * 1) > 0.5) {
//     newList.push(card)
//   } else {
//     newList.unshift(card)
//   }
// })
export const shuffle = (list) => {
  // const newList = []
  // // cheap initial shuffle
  // map(cheapImpureShuffle(newList))(list)
  const newList = [...list]
  // modified fisher-yates shuffle
  let start = newList.length
  while (start-- > 0) {
    const index = Math.floor(Math.random() * start + 1)
    const current = newList[index]
    const newer = newList[start]
    newList[index] = newer
    newList[start] = current
  }
  return newList
}

export const floor = (x) => Math.floor(Math.random() * x)
export const floorMin = curry((min, x) => floor(x) + min)

export const take = curry((full, o) => {
  if (!isType.boolean(full)) {
    throw new TypeError(`Expected full to be a boolean.`)
  }
  // ducktype: array-like with something in it
  if (o && o.length && !!o[0]) {
    const index = floor(o.length)
    const selection = o[index]
    if (!full) {
      return selection
    }
    return [selection]
  }
  // for objects
  const keys = Object.keys(o)
  const index = floor(keys.length)
  const key = keys[index]
  const value = o[key]
  if (!full) {
    return value
  }
  const out = {
    [key]: value
  }
  return out
})
// [a, b, c] => a|b|c
// {a, b, c} => a|b|c
export const pick = take(false)
// {a, b, c} => {a}|{b}|{c}
// [a, b, c] => [a]|[b]|[c]
export const grab = take(true)

export const task = curry((howMany, cb) => {
  return map(cb, rangeFinder(0, howMany))
})

// (2, [a, b, c, d]) => [c, a]
export const divvy = curry((howMany, ofThing) => {
  const picker = () => pick(ofThing)
  return task(howMany, picker)
})

export const word = (howLong = 5) => {
  if (!isType.number(howLong)) {
    throw new TypeError(`Expected to be given number for howLong.`)
  }
  const chunk = flow(
    divvy(howLong),
    join(``)
  )
  return chunk(alphabet)
}

export const junkObject = (howManyFields = 1) => {
  if (!isType.number(howManyFields)) {
    throw new TypeError(`Expected to be given number for howManyFields.`)
  }
  const simpleHydrate = (x) => {
    const key = `${x}${random.floorMin(1, 10e3)}`
    return {
      [key]: key
    }
  }
  const maker = flow(
    divvy(howManyFields),
    map(simpleHydrate),
    reduce(merge, {})
  )
  return maker(alphabet)
}

export const complexObject = (outerFields, innerFields) => {
  const make = () => task(outerFields, () => ({[word(5)]: junkObject(innerFields)}))
  const mash = reduce(merge, {})
  return mash(make())
}

Object.assign(random, {
  shuffle,
  floor,
  floorMin,
  take,
  pick,
  grab,
  divvy,
  junkObject,
  complexObject,
  word,
  task
})

export default random
