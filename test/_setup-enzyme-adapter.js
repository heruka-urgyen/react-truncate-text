/* eslint-disable */
const Enzyme = require("enzyme")
const Adapter = require("enzyme-adapter-react-16")
const {JSDOM} = require("jsdom")

Enzyme.configure({adapter: new Adapter()})

const jsdom = new JSDOM("<!doctype html><html><body></body></html>")
const {window} = jsdom

function copyProps(src, target) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target),
  })
}

global.window = window
global.document = window.document
global.navigator = {userAgent: "node.js"}
global.requestAnimationFrame = callback => setTimeout(callback, 0)
global.cancelAnimationFrame = clearTimeout

class ResizeObserver {
  constructor(callback) {
    this.callback = callback
  }

  async observe() {
    const ws = ResizeObserver.widths
    this.callback([{contentRect: {width: ws[0]}}])
    // simulate resize every tick
    for (let i = 1; i < ws.length; i++) {
      const w = await new Promise(r => r({contentRect: {width: ws[i]}}))
      this.callback([w])
    }
  }
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver

copyProps(window, global)
