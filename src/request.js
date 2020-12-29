'use strict'

const Body = require('./body')
const Headers = require('./headers')

class Request extends Body {
  constructor (input, init = {}) {
    super(init.body)

    if (input instanceof Request) {
      return new Request(input.url, {
        mode: input.mode === 'navigate' ? 'same-origin' : undefined,
        ...input
      })
    }

    this.url = new URL(input)

    this.method = init.method || 'GET'
    this.mode = init.mode || 'cors'

    this.headers = new Headers(init.headers)

    if ((this.method === 'GET' || this.method === 'HEAD') && this.body !== null) {
      throw TypeError(`${this.method} Request cannot have a body`)
    }
  }

  clone () {
    if (this.bodyUsed) {
      throw TypeError('Cannot clone Request - bodyUsed is true')
    }

    return new Request(this)
  }
}

module.exports = Request
