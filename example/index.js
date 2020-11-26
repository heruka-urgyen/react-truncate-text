/* eslint-disable react/prop-types */

import "./style.css"

import React, {useMemo, useState} from "react"
import {render} from "react-dom"
import debounceRender from "react-debounce-render"
import Truncate from "../src/index"

const range = (x, y) => Array.from({length: (y + 1) - x}, (_, i) => (x + i))
const randomNumber = n => Math.floor(Math.random() * n)
const randomDigit = () => randomNumber(10)

const chars = range("1".charCodeAt(0), "z".charCodeAt(0)).map(x => String.fromCharCode(x))
const randomString = (length = 1) =>
  range(1, length).map(_ => chars[randomNumber(chars.length)]).join("")

const Controlled = React.memo(() => {
  const initialState = "mmmmmmmmmiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiimmmmmm"
  const [value, setValue] = useState(initialState)
  const [width, setWidth] = useState(300)
  const [tailLength, setTailLength] = useState(randomDigit())

  return (
    <div className="controlled-container">
      <h1>controlled example</h1>
      <div className="text-container">
        <input
          className="value"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <input
          type="number"
          className="tail-length"
          value={tailLength}
          min={0}
          onChange={e => setTailLength(parseInt(e.target.value, 10) || 0)}
        />
      </div>
      <div style={{width: `${width}px`}} className="controlled-truncate-container">
        <Truncate
          tailLength={tailLength}
          className="controlled-truncate styled-truncate"
        >
          {value}
        </Truncate>
      </div>
      <input
        type="range"
        min="0"
        max="300"
        value={width}
        style={{width: "100%"}}
        onChange={e => {
          setWidth(e.target.value)
        }}
      />
    </div>
  )
})

const Rows = debounceRender(({widths, rows}) => {
  const data = useMemo(() => range(1, rows), [rows])
  const itemData = useMemo(() => range(1, rows + 1).map(_ => {
    const length = randomDigit() || 1

    return {
      tailLength: length,
      width: Math.max(100, randomDigit() * 30),
      evenValue: `${randomString(50)}${length}`,
      oddValue: `${randomString(1).repeat(50)}${length}`,
    }
  }), [rows])

  const className = "styled-truncate"

  return (
    <div>
      <table>
        <tbody>
          {data.map(i => (
            <tr className="row" key={i}>
              <td
                className="col"
                style={{
                  maxWidth: `${widths[0]}px`,
                  minWidth: `${widths[0]}px`,
                }}
              >
                <Truncate tailLength={itemData[i].tailLength} className={className}>
                  {itemData[i].evenValue}
                </Truncate>
              </td>
              <td
                className="col"
                style={{
                  maxWidth: `${widths[1]}px`,
                  minWidth: `${widths[1]}px`,
                }}
              >
                <Truncate tailLength={itemData[i].tailLength} className={className}>
                  {itemData[i].oddValue}
                </Truncate>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}, 100, {maxWait: 500})

const Table = () => {
  const rows = 2000
  const [v1, setV1] = useState(200)
  const [v2, setV2] = useState(200)

  return (
    <div>
      <h1>table with {rows} rows <span style={{fontSize: "1rem"}}>(debounced)</span></h1>
      <div>
        <div style={{textAlign: "center", display: "inline-block", width: "200px"}}>
          <input
            type="range"
            min="50"
            max="200"
            value={v1}
            style={{width: "100%"}}
            onChange={e => setV1(e.target.value)}
          />
        </div>
        <div style={{textAlign: "center", display: "inline-block", width: "200px"}}>
          <input
            type="range"
            min="50"
            max="200"
            value={v2}
            style={{width: "100%"}}
            onChange={e => setV2(e.target.value)}
          />
        </div>
      </div>
      <Rows widths={[v1, v2]} rows={rows} />
    </div>
  )
}

const App = () => (
  <div>
    <Controlled />
    <Table />
  </div>
)

render(
  <App />,
  document.querySelector(".container"),
)
