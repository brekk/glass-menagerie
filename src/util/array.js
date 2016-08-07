import curry from 'lodash/fp/curry'
import {isType} from './validators'

export const join = curry((delim, array) => {
  if (!isType.string(delim)) {
    throw new TypeError(`Expected delimiter to be string.`)
  }
  if (!Array.isArray(array)) {
    throw new TypeError(`Expected array to be given.`)
  }
  return array.join(delim)
})

export default {
  join
}
