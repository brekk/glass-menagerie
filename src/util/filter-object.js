import curry from 'lodash/fp/curry'
import filter from 'lodash/fp/filter'
import flow from 'lodash/fp/flow'
import toPairs from 'lodash/fp/toPairs'
import mergePairs from './merge-pairs'

export const filterKeysOfObject = curry((fn, obj) => {
  const filterize = flow(
    toPairs,
    filter(fn),
    mergePairs
  )
  return filterize(obj)
})

export default filterKeysOfObject
