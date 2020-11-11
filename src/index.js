import React, {useMemo} from "react"
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

const Truncate = ({children = "", tailLength, className, title = children}) => {
  const [init, tail] = useMemo(() => {
    const text = children.toString()

    if (tailLength > 0) {
      return [text.slice(0, -tailLength), text.slice(-tailLength)]
    }

    return [text, ""]
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
