import test from 'tape'
import {xtrace} from '../../src/util/trace'
import random from '../harness/random'
import id from 'lodash/fp/identity'

const a = random.word(5)
const b = random.word(5)

test(`xtrace must return the last of three potential arguments`, (assert) => {
  const output = xtrace(id, a, b)
  assert.plan(3)
  assert.equal(output, b)
  // partially apply curried functions
  assert.equal(typeof xtrace(id), `function`)
  assert.equal(typeof xtrace(id, a), `function`)
  assert.end()
})
