import React from 'react'
const types = React.PropTypes

export const Log = (props) => (<span>{props.text}</span>)
Log.propTypes = {
  text: types.string.isRequired
}

export default Log
