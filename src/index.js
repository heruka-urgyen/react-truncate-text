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

const identity = _ => _
const inc = x => x + 1
const dec = x => x - 1

const getTextLen = el => {
  const metrics = textMetrics.init(el)

  const inner = (width, initText, tailText, n, mode = "inc") => {
    const availableWidth = width - Math.ceil(metrics.width(tailText))
    const sizeFull = Math.ceil(metrics.width(initText))
    const isTruncated = sizeFull > availableWidth
    const [getNextVal, getReturnVal] = mode === "inc" ? [inc, dec] : [dec, identity]

    if (mode === "dec" && n === 1) {
      return [1, true]
    }

    if (!isTruncated) {
      return [initText.length, false]
    }

    const sizeTruncated = Math.ceil(metrics.width(`${initText.slice(0, n)}${truncSymbol}`))
    const recurCond = mode === "inc" ?
      sizeTruncated < availableWidth :
      sizeTruncated > availableWidth

    if (recurCond) {
      return inner(width, initText, tailText, getNextVal(n), mode)
    }

    return [Math.max(1, getReturnVal(n)), true]
  }

  return inner
}

const Truncate = props => {
  const children = props.children || ""
  const title = props.title || children
  const className = props.className || ""
  const tailLength = parseInt(props.tailLength, 10) || 0

  const [initRef, tailRef] = [useRef(), useRef()]
  const p = useRef({isTruncated: true, width: 0, n: 1, tailLength, text: ""})
  const prevRender = p.current
  const {ref, width} = useResizeObserver()
  const getInitLen = useMemo(() => {
    if (initRef.current) {
      return getTextLen(initRef.current)
    }

    return undefined
  }, [initRef.current])

  const [text, textInit, textTail] = useMemo(() => {
    const t = children.toString()

    return [t, t.slice(0, -tailLength), t.slice(-tailLength)]
  }, [children, tailLength])

  const [isTruncated, init, middle, tail] = useMemo(() => {
    const justTail = tailLength >= text.length
    const elWiderThanText =
      !prevRender.isTruncated && prevRender.width < width && prevRender.text === text
    const mode = (
      prevRender.text.length < text.length ||
      prevRender.width < width ||
      prevRender.tailLength > tailLength
    ) ? "inc" : "dec"

    prevRender.text = text
    prevRender.tailLength = tailLength

    if (justTail) {
      return [false, "", "", text]
    }

    if (getInitLen && tailLength > 0) {
      if (elWiderThanText) {
        return [false, textInit, "", textTail]
      }

      const [n, isTruncatedNext] = getInitLen(width, textInit, textTail, prevRender.n, mode)

      prevRender.n = n
      prevRender.width = width
      prevRender.isTruncated = isTruncatedNext

      return [isTruncatedNext, textInit.slice(0, n), textInit.slice(n), textTail]
    }

    return [false, text, "", ""]
  }, [text, tailLength, width, getInitLen])

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
