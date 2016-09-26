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
