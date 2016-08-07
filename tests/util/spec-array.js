import test from 'tape'
import {join} from '../../src/util/array'

const nospace = ``
const comma = `,`

test(`join should be an fp-version of array.prototype.join`, (assert) => {
  assert.plan(6)
  assert.equal(typeof join, `function`)
  assert.equal(typeof join(comma), `function`)
  const flatAlpha = `abcde`
  const aThroughE = flatAlpha.split(nospace)
  const output = join(nospace, aThroughE)
  assert.equal(output, flatAlpha)
  assert.equal(join(comma, aThroughE), aThroughE.join(comma))
  assert.throws(() => join(null, null), `Expected delimiter to be string.`)
  assert.throws(() => join(`,`, null), `Expected array to be given.`)
  assert.end()
})
