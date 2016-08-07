import React from 'react'
const types = React.PropTypes

export const ComponentWithKids = (props) => (<article>
  <h1>{props.text}</h1>
  {props.children}
</article>)
ComponentWithKids.propTypes = {
  text: types.string.isRequired,
  children: types.node
}

export default ComponentWithKids
