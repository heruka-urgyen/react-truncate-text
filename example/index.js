/* eslint-disable react/prop-types */

import "./style.css"

import React, {useState} from "react"
import {render} from "react-dom"
import {VariableSizeGrid as Grid} from "react-window"
import Truncate from "../src/index"

const range = (x, y) => Array.from({length: (y + 1) - x}, (_, i) => (x + i))
const randomDigit = () => Math.floor(Math.random() * 10)

const Cell = randomize => ({data, rowIndex, columnIndex, style}) => {
  const length = data[rowIndex + columnIndex]
  const odd = columnIndex % 2 === 1
  const description = odd ?
    `This cell has custom title, class and tail length of ${length}` :
    `This cell has tail length of ${length}`

  const title = odd ? "This is a custom title" : undefined
  const className = odd ? "odd" : undefined
  const style2 = odd && randomize ? {width: `${Math.max(100, length * 30)}px`} : null

  return (
    <div className="cell" style={{...style, ...style2}}>
      <Truncate tailLength={length} title={title} className={className}>
        {description}
      </Truncate>
    </div>
  )
}

const Table = () => {
  const rows = 2000
  const [randomize, setRandomize] = useState(true)
  const lengths = range(1, rows).map(_ => randomDigit())

  return (
    <div>
      <h1>{rows} rows of resizable cells</h1>
      <label htmlFor="randomize">
        <input
          id="randomize"
          type="checkbox"
          checked={randomize}
          onChange={_ => setRandomize(x => !x)}
        />
        randomize width
      </label>
      <Grid
        itemData={lengths}
        columnCount={2}
        columnWidth={i => i % 2 === 0 ? 220 : 360}
        height={window.screen.height - 200}
        rowCount={rows}
        rowHeight={() => 40}
        width={800}
      >
        {Cell(randomize)}
      </Grid>
    </div>
  )
}

render(
  <Table />,
  document.querySelector(".container"),
)
