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
    this.headers.guard = this.mode === 'no-cors' ? 'request-no-cors' : 'request'

    if ((this.method === 'GET' || this.method === 'HEAD') && this.body !== null) {
      throw TypeError(`${this.method} Request cannot have a body`)
    }

    this.cache = init.cache
    this.credentials = init.credentials || 'same-origin'
    this.destination = ''
    this.integrity = init.integrity
    this.redirect = init.redirect || 'follow'
    this.referrer = init.referrer || 'about:client'
    this.referrerPolicy = init.referrerPolicy || ''
  }

  clone () {
    if (this.bodyUsed) {
      throw TypeError('Cannot clone Request - bodyUsed is true')
    }

    return new Request(this)
  }
}

module.exports = Request
