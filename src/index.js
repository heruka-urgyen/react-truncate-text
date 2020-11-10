import React, {useState, useEffect} from "react"
import PropTypes from "prop-types"

const containerStyle = {
  display: "flex",
  width: "100%",
  alignItems: "center",
}

const initStyle = {
  overflow: "hidden",
  minWidth: 0,
  textOverflow: "ellipsis",
  whiteSpace: "pre",
}

const tailStyle = {
  whiteSpace: "pre",
}

const Truncate = ({children, tailLength, className = "", title = children}) => {
  const [[init, tail], setText] = useState([children, ""])

  useEffect(() => {
    if (tailLength > 0) {
      setText([children.slice(0, -tailLength), children.slice(-tailLength)])
    }
  }, [children, tailLength])

  return (
    <div className={className} style={containerStyle} title={title}>
      <span style={initStyle}>
        {init}
      </span>
      <span style={tailStyle}>
        {tail}
      </span>
    </div>
  )
}

Truncate.propTypes = {
  children: PropTypes.string.isRequired,
  tailLength: PropTypes.number.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
}

export default Truncate
