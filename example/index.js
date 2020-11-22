/* eslint-disable react/prop-types */

import "./style.css"

import React, {useMemo, useState} from "react"
import {render} from "react-dom"
import {VariableSizeGrid as Grid} from "react-window"
import Truncate from "../src/index"

const range = (x, y) => Array.from({length: (y + 1) - x}, (_, i) => (x + i))
const randomNumber = n => Math.floor(Math.random() * n)
const randomDigit = () => randomNumber(10)

const chars = range("1".charCodeAt(0), "z".charCodeAt(0)).map(x => String.fromCharCode(x))
const randomString = (length = 1) =>
  range(1, length).map(_ => chars[randomNumber(chars.length)]).join("")

const Cell = randomize => ({data, rowIndex, columnIndex, style}) => {
  const {tailLength, width, oddValue, evenValue} = data[rowIndex + columnIndex]
  const odd = columnIndex % 2 === 1
  const value = odd ? evenValue : oddValue
  const title = odd ? "This is a custom title" : undefined
  const className = "styled-truncate"
  const customStyle = odd && randomize ? {width: `${width}px`} : undefined

  return (
    <div className="cell" style={{...style, ...customStyle}}>
      <Truncate tailLength={tailLength} title={title} className={className}>
        {value}
      </Truncate>
    </div>
  )
}

const Rows = () => {
  const rows = 2000
  const [randomize, setRandomize] = useState(true)
  const itemData = useMemo(() => range(1, rows + 1).map(_ => {
    const length = randomDigit()

    return {
      tailLength: length,
      width: Math.max(100, randomDigit() * 30),
      evenValue: `${randomString(50)}${length}`,
      oddValue: `${randomString(1).repeat(50)}${length}`,
    }
  }), [])

  return (
    <div>
      <h1>{rows} rows of resizable cells</h1>
      <label htmlFor="randomize" className="randomize-toggle">
        <input
          id="randomize"
          type="checkbox"
          checked={randomize}
          onChange={_ => setRandomize(x => !x)}
        />
        randomize width
      </label>
      <Grid
        itemData={itemData}
        columnCount={2}
        columnWidth={i => i % 2 === 0 ? 220 : 360}
        height={window.innerHeight - 300}
        rowCount={rows}
        rowHeight={() => 40}
        width={800}
      >
        {Cell(randomize)}
      </Grid>
    </div>
  )
}

const Controlled = () => {
  const initialState = "mmmmmmmmmiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiimmmmmm"
  const [value, setValue] = useState(initialState)
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
      <div className="controlled-truncate-container">
        <Truncate
          tailLength={tailLength}
          className="controlled-truncate styled-truncate"
        >
          {value}
        </Truncate>
      </div>
    </div>
  )
}

const Table = () => (
  <div>
    <Controlled />
    <Rows />
  </div>
)

render(
  <Table />,
  document.querySelector(".container"),
)
