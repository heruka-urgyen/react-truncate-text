import {testProp, fc} from "ava-fast-check"
import {mount} from "enzyme"
import React from "react"
import Truncate from "../src/index"

testProp(
  "should render component and set properties correctly",
  [
    fc.option(fc.nat(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
    fc.option(fc.string(), {nil: undefined}),
  ],
  (t, tailLength, children, title, className) => {
    const wrapper = mount(
      <Truncate tailLength={tailLength} title={title} className={className}>
        {children}
      </Truncate>,
    )

    const containerNode = wrapper.first().getDOMNode()
    const containerNodeStyle = getComputedStyle(containerNode)
    const textNodes = wrapper.children().first().children()
    const init = textNodes.first()
    const tail = textNodes.last()
    const initNodeStyle = getComputedStyle(init.getDOMNode())
    const tailNodeStyle = getComputedStyle(tail.getDOMNode())
    const titleAttr = containerNode.title
    const classNameAttr = containerNode.className

    t.true(init.text() + tail.text() === wrapper.text())

    // fallback when children are not passed
    t.true(wrapper.text() === children || wrapper.text() === "")

    // fallback when tailLength is not passed
    t.true(tailLength > 0 || init.text() === wrapper.text())

    // fallback when title is not passed
    t.true(titleAttr === title || titleAttr === wrapper.text())

    // className is optional
    t.true(!className || classNameAttr === className)

    // styles are set correctly to display overflown text as ellipsis
    t.is(containerNodeStyle.getPropertyValue("display"), "flex")
    t.is(containerNodeStyle.getPropertyValue("width"), "100%")
    t.is(containerNodeStyle.getPropertyValue("align-items"), "center")
    t.is(initNodeStyle.getPropertyValue("overflow"), "hidden")
    t.is(initNodeStyle.getPropertyValue("text-overflow"), "ellipsis")
    t.is(initNodeStyle.getPropertyValue("min-width"), "0")
    t.is(initNodeStyle.getPropertyValue("white-space"), "pre")
    t.is(tailNodeStyle.getPropertyValue("white-space"), "pre")
  },
)
