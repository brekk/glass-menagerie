import reduce from 'lodash/fp/reduce'
import cloneDeep from 'lodash/fp/cloneDeep'

export const mergePairs = reduce((structure, [key, value]) => {
  const copy = cloneDeep(structure)
  copy[key] = value
  return copy
}, {})

export default mergePairs
