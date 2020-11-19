import React, {useMemo, useState, useRef, useEffect} from "react"
import PropTypes from "prop-types"
import useResizeObserver from "use-resize-observer"

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

const sum = xs => xs.reduce((x, y) => x + y, 0)
const onCopy = e => {
  e.preventDefault()

  const text = window.getSelection().toString()
  e.clipboardData.setData("text/plain", text.replace("\n", ""))
}

const Truncate = ({children = "", tailLength = 0, className, title = children}) => {
  const [initRef, tailRef] = [useRef(), useRef()]
  const [initEl, tailEl] = [initRef.current, tailRef.current]
  const [text, textInit, textTail] = useMemo(() => {
    const text = children.toString()

    return [text, text.slice(0, -tailLength), text.slice(-tailLength)]
  }, [children, tailLength])
  const [[init, tail], setState] = useState([text, ""])
  const [textWidth, setTextWidth] = useState(0)
  const {ref, width} = useResizeObserver()

  useEffect(() => {
    if (initEl && tailEl) {
      setTextWidth(sum([initEl, tailEl].map(x => x.scrollWidth)))
    }
  }, [initEl, tailEl])

  useEffect(() => {
    setTimeout(() => {
      const isTruncated = width < textWidth

      if (tailLength === 0 || (tail !== "" && !isTruncated)) {
        setState([text, ""])
      }

      if (tailLength > 0 && tail === "" && isTruncated) {
        setState([textInit, textTail])
      }
    }, 0)
  }, [width, textWidth])

  return (
    <div ref={ref} className={className} style={containerStyle} title={title} onCopy={onCopy}>
      <span ref={initRef} style={initStyle}>
        {init}
      </span>
      <span ref={tailRef} style={tailStyle}>
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
