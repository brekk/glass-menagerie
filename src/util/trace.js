import curry from 'lodash/fp/curry'

export const xtrace = curry((log, a, b) => {
  log(a, b)
  return b
})

export const trace = xtrace(console.log.bind(console))

export default trace
