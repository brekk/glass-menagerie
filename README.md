![](https://circleci.com/gh/brekk/glass-menagerie.svg?style=shield&circle-token=55f2885e65a163dee6ea47f7aa1c71c81b0d552c)

# glass-menagerie
## Toolkit to convert jsx to pug (formerly jade)
> "How beautiful it is, and how easily it can be broken."
> - Tennessee Williams

### Description

This module is used to a sample file like [this](https://github.com/brekk/glass-menagerie/blob/master/tests/fixtures/fixture-blog-post-jsx.js):

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

Into a simple `pug` (formerly `jade`) representation with values [auto-generated](https://github.com/brekk/glass-menagerie/blob/master/src/proptypes.js#L150-L172) based on the exported `propTypes` value:

```pug
//- tests/fixtures/fixture-blog-post-jsx.js
.blog-post
  h1 ljvzxdbkor
  strong 673
  p jrkbwvezxl
```

### Goal

* To create a pipeline in which simple React (for now, with eventual plans for other various analogous frameworks) components can be represented as `pug` "snapshots".
  - It is likely that this snapshots will become brittle (and will require re-generation) over time, but ideally these can be used to represent lightweight versions of existing components as a proxy for rapid prototyping and iteration using something like [Codepen](https://codepen.io)

### Installation
```sh
npm i glass -S
```

### CLI Usage

```sh
glass --help
```
Output:
```sh
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
