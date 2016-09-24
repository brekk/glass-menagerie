import React from 'react'
const {PropTypes: types} = React
export const propTypes = {
  title: types.string,
  number: types.number,
  description: types.string
}
export const Blog = (props) => (<div className="blog-post">
  <h1>{props.title}</h1>
  <strong>{props.number}</strong>
  <p>{props.description}</p>
</div>)
Blog.propTypes = propTypes
export default Blog
