import flow from 'lodash/fp/flow'
import yml from 'js-yaml'

const {safeLoad: parse} = yml

const fixNewLines = (x) => x.replace(/\\n/g, `\n`)

export const yaml = flow(
  fixNewLines,
  parse
)

export default yaml
