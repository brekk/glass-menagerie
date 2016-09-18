import test from 'ava'
import yaml from '../../src/util/yaml'

test(`yaml should parse raw yaml strings`, (t) => {
  t.plan(2)
  t.is(typeof yaml, `function`)
  const input = `shit: whatever\ncool: pants`
  t.deepEqual(yaml(input), {shit: `whatever`, cool: `pants`})
})
