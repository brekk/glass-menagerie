import React from 'react'
const types = React.PropTypes

export const Hello = () => (<p>Hello</p>)

export const Log = (props) => (<span>{props.text}</span>)
Log.propTypes = {
  text: types.string.isRequired
}

export default {
  Hello,
  Log
}
