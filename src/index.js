import React, {useMemo, useState, useRef, useEffect} from "react"
import PropTypes from "prop-types"
import useResizeObserver from "use-resize-observer/polyfilled"
import textMetrics from "text-metrics"

import "./style.css"

const containerStyle = {
  overflow: "hidden",
  textOverflow: "clip",
  whiteSpace: "pre",
}

const midStyle = {
  fontSize: 0,
  opacity: 0,
}

const getInitStyle = tailLength => tailLength > 0 ? {} : {
  display: "inline-block",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "100%",
}

const sum = xs => xs.reduce((x, y) => x + y, 0)
const getInitLen = (el, availableWidth, text, n) => {
  if (availableWidth < 2) {
    return 1
  }

  const size = Math.floor(
    textMetrics.init(el).width(`${text.slice(0, n)}...`)
  )

  const r = Math.floor(availableWidth / size)

  if (size < availableWidth) {
    return getInitLen(el, availableWidth, text, n + r)
  }

  return Math.max(1, n - 1)
}

const Truncate = ({children = "", tailLength = 0, className, title = children}) => {
  const [initRef, tailRef] = [useRef(), useRef()]
  const [initEl, tailEl] = [initRef.current, tailRef.current]
  const [text, textInit, textTail] = useMemo(() => {
    const text = children.toString()

    if (tailLength > 0) {
      return [text, text.slice(0, -tailLength), text.slice(-tailLength)]
    }

    return [text, text, ""]
  }, [children, tailLength])

  const [[init, middle], setText] = useState([textInit, "", textTail])
  const [[textWidth, charWidth], setTextWidth] = useState([0, 0])

  const {ref, width} = useResizeObserver()
  const containerRef = textWidth > 0 ? ref : null
  const isTruncated = width < textWidth

  useEffect(() => {
    if (tailLength > 0 && initEl && tailEl) {
      const offsetWidth = sum([initEl, tailEl].map(x => x.offsetWidth))
      const charWidth = Math.ceil(offsetWidth / text.length)

      setTextWidth([offsetWidth, charWidth])
    }
  }, [initEl, tailEl])

  useEffect(() => {
    if (tailLength > 0) {
      if (isTruncated) {
        const availableWidth = width - tailEl.offsetWidth
        const n = getInitLen(initEl, availableWidth, textInit, 1)

        setText([textInit.slice(0, n), textInit.slice(n)])
      } else {
        setText([textInit, ""])
      }
    }
  }, [width, textWidth])

  return (
    <div ref={containerRef} className={className} style={containerStyle} title={title}>
      <span
        ref={initRef}
        style={getInitStyle(tailLength)}
        className={isTruncated ? "react-truncate-text-truncated" : null}
      >
        {init}
      </span>
      <span style={midStyle}>{middle}</span>
      <span ref={tailRef}>{textTail}</span>
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
