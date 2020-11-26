import React, {useState, useLayoutEffect, useMemo, useRef} from "react"
import PropTypes from "prop-types"
import textMetrics from "text-metrics"
import debounce from "lodash.debounce"

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

  const recur = (text, availableWidth, averageCharWidth, n) => {
    const res = text.slice(0, n)

    if (res.length < 2) {
      return 1
    }

    const sizeTruncated = Math.ceil(metrics.width(`${res}${truncSymbol}`))
    const m = n - Math.ceil((sizeTruncated - availableWidth) / averageCharWidth)

    if (sizeTruncated > availableWidth) {
      return recur(text, availableWidth, averageCharWidth, m)
    }

    return n
  }

  const inner = (width, initText, tailText) => {
    const tailLength = Math.ceil(metrics.width(tailText))
    const availableWidth = width - tailLength
    const initTextWidth = Math.ceil(metrics.width(initText))
    const averageCharWidth = Math.ceil(initTextWidth / initText.length)
    const isTruncated = initTextWidth > availableWidth

    if (!isTruncated) {
      return [initText.length, false]
    }

    if (availableWidth < 1) {
      return [1, true]
    }

    const n = Math.floor(availableWidth / averageCharWidth) - 1

    return [recur(initText, availableWidth, availableWidth, n), true]
  }

  return inner
}

const Truncate = props => {
  const children = props.children || ""
  const title = props.title || children
  const className = props.className || ""
  const tailLength = parseInt(props.tailLength, 10) || 0

  const [ref, initRef, tailRef] = [useRef(), useRef(), useRef()]
  const p = useRef({isTruncated: true, width: undefined, n: 1, tailLength, text: ""})
  const prevRender = p.current
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

  const [width, setWidth] = useState(0)
  const [[isTruncated, init, middle, tail], setState] =
    useState([true, textInit, "", textTail])

  const updateWidth = useMemo(() => debounce(() => {
    const newWidth = ref.current.offsetWidth

    if (newWidth !== width) {
      setWidth(newWidth)
    }
  }, 250), [])

  useLayoutEffect(() => {
    // first render
    if (prevRender.width === undefined) {
      const newWidth = ref.current.offsetWidth
      setWidth(newWidth)
    } else {
      updateWidth()
    }

    return () => {
      updateWidth.cancel()
    }
  }, [props])

  useLayoutEffect(() => {
    const justTail = tailLength >= text.length
    const elWiderThanText =
      !prevRender.isTruncated && prevRender.width < width && prevRender.text === text

    prevRender.text = text
    prevRender.tailLength = tailLength
    prevRender.width = width

    if (justTail) {
      setState([false, "", "", text])
      return
    }

    if (getInitLen && tailLength > 0) {
      if (elWiderThanText) {
        setState([false, textInit, "", textTail])
        return
      }

      const [n, isTruncatedNext] = getInitLen(width, textInit, textTail)

      prevRender.isTruncated = isTruncatedNext

      setState([isTruncatedNext, textInit.slice(0, n), textInit.slice(n), textTail])
      return
    }

    setState([false, text, "", ""])
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
