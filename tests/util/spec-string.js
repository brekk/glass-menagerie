import test from 'tape'
import {split, trim, trimmer} from '../../src/util/string'

test(`string.split must be an fp version of str.prototype.split`, (assert) => {
  const delim = `,`
  const input = `a,b,c`
  assert.plan(3)
  assert.equal(typeof split, `function`)
  const partial = split(delim)
  assert.equal(typeof partial, `function`)
  const output = partial(input)
  assert.same(output, `abc`.split(``))
  assert.end()
})

test(`string.trim must be an fp version of str.prototype.trim`, (assert) => {
  const input = `   a    `
  assert.plan(2)
  assert.equal(typeof trim, `function`)
  const output = trim(input)
  assert.equal(output, `a`)
  assert.end()
})

test(`string.trimmer must be mapped form of string.trim`, (assert) => {
  const input = [`   a    `, `   b`, `  c      `, `d    `]
  assert.plan(2)
  assert.equal(typeof trimmer, `function`)
  const output = trimmer(input)
  assert.same(output, `abcd`.split(``))
  assert.end()
})
