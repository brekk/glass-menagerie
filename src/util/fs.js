import fs from 'fs'
import flow from 'lodash/fp/flow'

/* istanbul ignore next */
export const readFile = (file) => fs.readFileSync(file, `utf8`)

/* istanbul ignore next */
export const json = flow(
  readFile,
  JSON.parse
)

/* istanbul ignore next */
export default {
  readFile,
  json
}
