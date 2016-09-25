import React from 'react'
const types = React.PropTypes

export const Log = (props) => (<a href={props.href}>{props.text}</a>)
export const propTypes = {
  text: types.string.isRequired,
  href: types.string.isRequired
}
Log.propTypes = propTypes

export default Log
