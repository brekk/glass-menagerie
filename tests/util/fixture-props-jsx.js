import React from 'react'
const types = React.PropTypes

export const Log = (props) => (<a href={props.href}>{props.text}</a>)
Log.propTypes = {
  text: types.string.isRequired,
  href: types.string.isRequired
}

export default Log
