import curry from 'lodash/fp/curry'
import map from 'lodash/fp/map'

export const split = curry((delim, str) => str.split(delim))
export const trim = (x) => x.trim()
export const trimmer = map(trim)

export default {
  split,
  trim,
  trimmer
}
