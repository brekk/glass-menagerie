![](https://circleci.com/gh/brekk/glass-menagerie.svg?style=shield&circle-token=55f2885e65a163dee6ea47f7aa1c71c81b0d552c)

# glass-menagerie
## Toolkit to convert jsx to pug (formerly jade)
> "How beautiful it is, and how easily it can be broken."
> - Tennessee Williams

### Description

This module is used to take a sample file like [this](https://github.com/brekk/glass-menagerie/blob/master/tests/fixtures/fixture-blog-post-jsx.js):

```js
const React = require(`react`)
const {PropTypes: types} = React

export const Blog = (props) => (
  <div className="blog-post">
    <h1>{props.title}</h1>
    <strong>{props.number}</strong>
    <p>{props.description}</p>
  </div>
)

export const propTypes = {
  title: types.string,
  number: types.number,
  description: types.string
}

Blog.propTypes = propTypes

export default Blog
```
(_from [fixture-blog-post-jsx.js](https://github.com/brekk/glass-menagerie/blob/master/tests/fixtures/fixture-blog-post-jsx.js)_)

Into a simple [pug](https://pugjs.org/api/getting-started.html) (formerly `jade`) representation with values [auto-generated](https://github.com/brekk/glass-menagerie/blob/master/src/proptypes.js#L150-L172) based on the exported `propTypes` value:

```jade
//- tests/fixtures/fixture-blog-post-jsx.js
//- autogenerated by glass, to recreate, run:
//- glass --output=tests/fixtures --allow-empty-props -f tests/fixtures/fixture-blog-post-jsx.js
.blog-post
  h1 kqnjlltgkc
  strong 423
  p pwsgwaovpz
```
(_from [fixture-blog-post-jsx.pug](https://github.com/brekk/glass-menagerie/blob/master/tests/fixtures/fixture-blog-post-jsx.js)_)

### Goal

  * To create a pipeline in which simple React (for now, with eventual plans for other various analogous frameworks) components can be represented as `pug` "snapshots".
    - It is likely that this snapshots will become brittle (and will require re-generation) over time, but ideally these can be used to represent lightweight versions of existing components as a proxy for rapid prototyping and iteration using something like [Codepen](https://codepen.io)


### Installation
```sh
npm i glass -S
```

In order to run the `glass` tool effectively, it would probably be helpful to frame the settings for the tool:

#### Inputs
  * props (`-p`, `--props`)
    - file - [ .yml | .yaml | .json ]
      +
    - raw (yaml) - e.g. `text: link\nhref: //wikipedia.org`
    - `lax` - the literal string "lax" => the same as "infer", only it will default to an empty props object
    - `infer` - the literal string "infer" => this is great if you `export const propTypes = {}` in the given file (default)
  * files (`-f`, `--files`, `--file`)
    - one or more files (using `globby` and `glob-watcher` under the hood, so any valid inputs to those count here)
    - behavior is different based on whether there's a single matched file or more than one, see **Outputs** below.
  * config (`-c`, `--config`)
    - refer to an explicit `json` or `yaml` file for configuration
    - by default `glass` will check your package.json for a `"glass"` field and will use the config there. Use `--no-config` to disable this behavior.

#### Switches
  * include (`-i`, `--include`)
    - explicitly include for filtering (especially helpful if you have an existing config but want to see a different output)
    ```sh
      # long flags, include
      glass --props "href: https://github.com/brekk/glass-menagerie\ntext: github" --files "./tests/fixtures/fixture-*,!*.pug" --include "*cool-stuff.pug"
      # short flags, include
      glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f "./tests/fixtures/fixture-*,!*.pug" -i "*cool-stuff.pug"
      ```
  * exclude (`-x`, `--exclude`)
    - explicitly exclude for filtering (especially helpful if you have an existing config but want to see a different output)
    ```sh
      # long flags, exclude
      glass --props "href: https://github.com/brekk/glass-menagerie\ntext: github" --files "./tests/fixtures/fixture-*,!*.pug" -exclude "*cool-stuff.pug"
      # short flags, exclude
      glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f "./tests/fixtures/fixture-*,!*.pug" -x "*cool-stuff.pug"
      ```
  * watch (`-w`, `--watch`)
    - automatically re-run build on change
  * no-config (`-n`, `--no-config`)
    - ignore presence of existing config, especially useful for one-off generation or testing
#### Outputs
  * log (`-l`, `--log`) - "json" || "yml" || "yaml" || "./path/to/glass-menagerie.log"
    - generate a verbose log in `json` | `yml` output, perfect for consumption by machines or intermediate storage
    ```sh
    # verbose flags - single file
    glass --props "href: https://github.com/brekk/glass-menagerie\ntext: github" --file ./tests/fixtures/fixture-blog-post-jsx.js --log yml
    # short glags - single file
    glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f ./tests/fixtures/fixture-blog-post-jsx.js -l json
    # verbose flags - multiple files (note the quotes, required if you wanna get fancy)
    glass --props "href: https://github.com/brekk/glass-menagerie\ntext: github" --files "./tests/fixtures/fixture-*,!*.pug" --log yaml
    # verbose flags - multiple files
    glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f "./tests/fixtures/fixture-*,!*.pug" -l yaml
    ```
  * directory (`-d`, `--directory`) - "/path/to/directory"
    - write the outputs to files, based on matched filename and relative pathing (see examples for more detail)
    ```sh
    # verbose flags - single file
    glass --props "href: https://github.com/brekk/glass-menagerie\ntext: github" --file ./tests/fixtures/fixture-blog-post-jsx.js --directory ./tests/fixtures
    # short glags - single file
    glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f ./tests/fixtures/fixture-blog-post-jsx.js -d ./tests/fixtures
    ```
  * full output (`-o`, `--output`)
    - _*_ with a config.directory given, this will write out:
    ```sh
    glass --props "href: https://github.com/brekk/glass-menagerie\ntext: github" --file ./tests/fixtures/fixture-blog-post-jsx.js --directory ./tests/fixtures --output
    # short glags - single file
    glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f ./tests/fixtures/fixture-blog-post-jsx.js -d ./tests/fixtures -o
    ```
  * raw
    - when running in single-file mode only (and with no other output flags active), the default is to print the information to `stdout`
    ```sh
    # automagically pipe to the clipboard (on mac)
    glass -p "href: https://github.com/brekk/glass-menagerie\ntext: github" -f ./tests/fixtures/fixture-blog-post-jsx.js | pbcopy
    ```

### CLI Usage

```sh
glass --help
```
Output:
```
Usage: glass [options]

Options:

  -h, --help               output usage information
  -V, --version            output the version number
  -a, --auto-mock          automagically pull exported 'propTypes' in
  -p, --props <p>          raw props
  -q, --prop-file <f>      prop file
  -o, --output <o>         save output to file (defaults to stdout)
  -w, --no-write           don't write output to files, just output to stdout
  -n, --allow-empty-props  be lax on the explicit propTypes export rule
```

To auto-mock and convert your files, add this to your `package.json`:

```json
"glass": {
  "files": [
    "tests/fixtures/fixture-*jsx.js"
  ],
  "output": "codepen",
  "allowEmptyProps": false
}
```
