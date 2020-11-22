import {testProp, fc} from "ava-fast-check"
import {mount} from "enzyme"
import React from "react"

import Truncate from "../src/index"

const nextTick = () => new Promise(r => r())

testProp.serial(
  "should render component and set properties correctly",
  [
    fc.nat(),
    fc.option(
      fc.integer(),
      {nil: undefined},
      fc.string(),
      fc.falsy(),
      fc.array(),
      fc.object(),
      fc.func(),
    ),
    fc.option(
      fc.fullUnicodeString(),
      fc.uuid(),
      fc.lorem(),
      fc.emailAddress(),
      fc.webUrl(),
      fc.falsy(),
      {nil: undefined},
    ),
    fc.option(fc.string(), fc.falsy(), {nil: undefined}),
    fc.option(fc.string(), fc.falsy(), {nil: undefined}),
  ],
  (t, width, tailLength, children, title, className) => {
    ResizeObserver.widths = [width]

    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const containerNode = wrapper.first().getDOMNode()
    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()
    const titleAttr = containerNode.title
    const classNameAttr = containerNode.className
    const initClassName = init.getDOMNode().className

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())

    // fallback when children are not passed
    t.true(wrapper.text() === children || wrapper.text() === "")

    // fallback when tailLength is not passed or wrong type
    t.true(!Number.isNaN(tailLength) || init.text() === wrapper.text())

    // fallback when title is not passed
    t.true(titleAttr === title || titleAttr === wrapper.text())

    // className is optional
    t.true(
      classNameAttr === "react-truncate-text-container " ||
      classNameAttr === `react-truncate-text-container ${className}`,
    )

    if (tailLength === 0) {
      t.is(initClassName, "react-truncate-text-no-tail")
    }
  },
)

testProp.serial(
  "should render when tailLength > 0 and tailLength >= text length",
  [
    fc.tuple(fc.integer({min: 1}), fc.string()).filter(([t, c]) => t >= c.length),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  (t, [tailLength, children], title, className) => {
    ResizeObserver.widths = [1000]

    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() === "")
    t.true(mid.text() === "")
    t.true(tail.text() === wrapper.text())
  },
  {verbose: 2},
)

testProp.serial(
  "should render when tailLength > 0 and element is wider than text",
  [
    fc.tuple(
      fc.integer({min: 1}),
      fc.integer({min: 1}),
      fc.string(),
    ).filter(([t, w, c]) => t < c.length && w > c.length * 20),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  (t, [tailLength, width, children], title, className) => {
    ResizeObserver.widths = [width - 1, width]

    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() === children.slice(0, -tailLength))
    t.true(mid.text() === "")
    t.true(tail.text() === children.slice(-tailLength))
  },
  {verbose: 2},
)

testProp.serial(
  "should truncate when tailLength > 0 and text is wider than element",
  [
    fc.tuple(
      fc.integer({min: 1}),
      fc.integer({min: 1}),
      fc.string(),
    ).filter(([w, t, c]) => c.length > w && t < c.length),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  (t, [width, tailLength, children], title, className) => {
    ResizeObserver.widths = [width]

    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()
    const initClassName = init.getDOMNode().className

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() + mid.text() === children.slice(0, -tailLength))
    t.true(init.text().length > 0)

    if (children.length - tailLength === 1) {
      t.true(mid.text().length === 0)
    } else {
      t.true(mid.text().length > 0)
    }

    t.true(tail.text() === children.slice(-tailLength))
    t.is(initClassName, "react-truncate-text-truncated")
  },
  {verbose: 2},
)

testProp.serial(
  "should truncate first then show full text when element is enlarged",
  [
    fc.tuple(
      fc.tuple(fc.integer({min: 1}), fc.integer({min: 1000})),
      fc.integer({min: 1}),
      fc.string(),
    ).filter(([[w1, w2], t, c]) => c.length > w1 && c.length * 20 < w2 && t < c.length),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  async (t, [widths, tailLength, children], title, className) => {
    ResizeObserver.widths = widths

    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() + mid.text() === children.slice(0, -tailLength))
    t.true(init.text().length > 0)

    if (children.length - tailLength === 1) {
      t.true(mid.text().length === 0)
    } else {
      t.true(mid.text().length > 0)
    }

    t.true(tail.text() === children.slice(-tailLength))

    await nextTick()

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() === children.slice(0, -tailLength))
    t.true(mid.text() === "")
    t.true(tail.text() === children.slice(-tailLength))
  },
  {verbose: 2},
)

testProp.serial(
  "should show full text first then truncate when element is shrinked",
  [
    fc.tuple(
      fc.tuple(fc.integer({min: 1000}), fc.integer({min: 1})),
      fc.integer({min: 1}),
      fc.string(),
    ).filter(([[w1, w2], t, c]) => c.length > w2 && c.length * 20 < w1 && t < c.length),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  async (t, [widths, tailLength, children], title, className) => {
    ResizeObserver.widths = widths

    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() === children.slice(0, -tailLength))
    t.true(mid.text() === "")
    t.true(tail.text() === children.slice(-tailLength))

    await nextTick()

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() + mid.text() === children.slice(0, -tailLength))
    t.true(init.text().length > 0)

    if (children.length - tailLength === 1) {
      t.true(mid.text().length === 0)
    } else {
      t.true(mid.text().length > 0)
    }

    t.true(tail.text() === children.slice(-tailLength))
  },
  {verbose: 2},
)

testProp.serial(
  "should render correctly when tailLength changes (0|n) between renders",
  [
    fc.tuple(
      fc.integer({min: 1}),
      fc.string(),
    ).filter(([t, c]) => t < c.length),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  (t, [tailLength, children], title, className) => {
    ResizeObserver.widths = [1]

    const wrapper = mount(
      <Truncate tailLength={0} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const mid = textNodes.at(1)
    const tail = textNodes.last()
    const initClassName = () => init.getDOMNode().className

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() === wrapper.text())
    t.true(mid.text() === "")
    t.true(tail.text() === "")
    t.is(initClassName(), "react-truncate-text-no-tail")

    wrapper.setProps({tailLength})

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() + mid.text() === children.slice(0, -tailLength))
    t.true(init.text().length > 0)

    if (children.length - tailLength === 1) {
      t.true(mid.text().length === 0)
    } else {
      t.true(mid.text().length > 0)
    }
    t.true(tail.text() === children.slice(-tailLength))
    t.is(initClassName(), "react-truncate-text-truncated")

    wrapper.setProps({tailLength: 0})

    t.true(init.text() + mid.text() + tail.text() === wrapper.text())
    t.true(wrapper.text() === children)
    t.true(init.text() === wrapper.text())
    t.true(mid.text() === "")
    t.true(tail.text() === "")
    t.is(initClassName(), "react-truncate-text-no-tail")
  },
  {verbose: 2},
)
