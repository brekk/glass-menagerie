import path from 'path'
import execa from 'execa'
import test from 'ava'
// import curry from 'lodash/fp/curry'
const CMD = `glass`
const rel = (x) => path.resolve(__dirname, `../../lib/cli/`, x)
// import _debug from 'debug'
// const debug = _debug(`glass-menagerie:tests:cli`)

test(`cli ${CMD} should print`, async (t) => {
  t.plan(1)
  const out = await execa(rel(CMD + `.js`), [`--allow-empty-props`])
  t.deepEqual(out, {stdout: `{}`, stderr: ``})
})
test(`cli ${CMD} --help should print`, async (t) => {
  t.plan(1)
  const out = await execa(rel(CMD + `.js`), [`--help`])
  const raw = [
    ``,
    `  Usage: glass [options]`,
    ``,
    `  Options:`,
    ``,
    `    -h, --help               output usage information`,
    `    -V, --version            output the version number`,
    `    -a, --auto-mock          automagically pull exported 'propTypes' in`,
    `    -p, --props <p>          raw props`,
    `    -q, --prop-file <q>      prop file`,
    `    -f, --files, --file <f>  glob`,
    `    -x, --no-config          don't use config, even if set in package.json`,
    `    -o, --output <o>         save output to file (defaults to stdout)`,
    `    -w, --no-write           don't write output to files, just output to stdout`,
    `    -n, --allow-empty-props  be lax on the explicit propTypes export rule`,
    ``
  ].join(`\n`)
  t.is(out.stdout, raw)
})
