/* eslint-disable react/prop-types */

import "./style.css"

import React, {useState} from "react"
import {render} from "react-dom"
import Truncate from "../src/index"

const range = (x, y) => Array.from({length: (y + 1) - x}, (_, i) => (x + i))
const randomDigit = () => Math.floor(Math.random() * 10)

const Cell = ({randomize, even}) => {
  const length = randomDigit()
  const description = even ?
    `This cell has custom title, class and tail length of ${length}` :
    `This cell has tail length of ${length}`

  const title = even ? "This is a custom title" : undefined
  const className = even ? "even" : undefined
  const style = randomize ? {width: `${Math.max(100, randomDigit() * 30)}px`} : null

  return (
    <div className="cell" style={style}>
      <Truncate tailLength={length} title={title} className={className}>
        {description}
      </Truncate>
    </div>
  )
}

const Table = () => {
  const [randomize, setRandomize] = useState(false)
  const rows = 2000

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
      {range(1, rows).map(i => (
        <div key={i}>
          <Cell />
          <Cell randomize={i > 1 && randomize} even />
        </div>
      ))}
    </div>
  )
}

render(
  <Table />,
  document.querySelector(".container"),
)
