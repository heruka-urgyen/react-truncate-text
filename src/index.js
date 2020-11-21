import React, {useMemo, useRef} from "react"
import PropTypes from "prop-types"
import useResizeObserver from "use-resize-observer/polyfilled"
import textMetrics from "text-metrics"

import "./style.css"

const truncSymbol = "..."
const getInitClassName = (tailLength, isTruncated) => {
  if (tailLength === 0) {
    return "react-truncate-text-no-tail"
  }

  if (isTruncated) {
    return "react-truncate-text-truncated"
  }

  return undefined
}

const getTextLen = el => {
  const metrics = textMetrics.init(el)

  const inner = (width, initText, tailText, n) => {
    const availableWidth = width - Math.ceil(metrics.width(tailText))
    const sizeFull = Math.ceil(metrics.width(initText))
    const isTruncated = sizeFull > availableWidth

    if (!isTruncated) {
      return [initText.length, false]
    }

    const sizeTruncated = Math.ceil(
      metrics.width(`${initText.slice(0, n)}${truncSymbol}`),
    )

    if (sizeTruncated < availableWidth) {
      return inner(width, initText, tailText, n + 1)
    }

    return [Math.max(1, n - 1), true]
  }

  return inner
}

const Truncate = ({children = "", tailLength = 0, className, title = children}) => {
  const [initRef, tailRef] = [useRef(), useRef()]
  const {ref, width} = useResizeObserver()
  const getInitLen = useMemo(() => {
    if (initRef.current) {
      return getTextLen(initRef.current)
    }

    return undefined
  }, [initRef.current])

  const [isTruncated, init, middle, tail] = useMemo(() => {
    const text = children.toString()

    if (tailLength >= text.length) {
      return [false, "", "", text]
    }

    if (getInitLen && tailLength > 0) {
      const textInit = text.slice(0, -tailLength)
      const textTail = text.slice(-tailLength)
      const [n, isT] = getInitLen(width, textInit, textTail, 1)

      return [isT, textInit.slice(0, n), textInit.slice(n), textTail]
    }

    return [false, text, "", ""]
  }, [children, tailLength, width, getInitLen])

  return (
    <div ref={ref} className={`react-truncate-text-container ${className}`} title={title}>
      <span
        ref={initRef}
        className={getInitClassName(tailLength, isTruncated)}
        data-trunc-symbol={truncSymbol}
      >
        {init}
      </span>
      <span className="react-truncate-text-mid">{middle}</span>
      <span ref={tailRef}>{tail}</span>
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
