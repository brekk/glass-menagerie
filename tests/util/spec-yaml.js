import test from 'tape'
import yaml from '../../src/util/yaml'

test(`yaml should parse raw yaml strings`, (t) => {
  t.plan(2)
  t.equal(typeof yaml, `function`)
  const input = `shit: whatever\ncool: pants`
  t.same(yaml(input), {shit: `whatever`, cool: `pants`})
  t.end()
})
