'use strict'
const Body = require('./body')
const Headers = require('./headers')

class Response extends Body {
  constructor (body = undefined, init = {}) {
    super(body)

    this.headers = new Headers(init.headers)
    this.ok = this.status >= 200 && this.status <= 299
    this.redirected = false // something with a url list
    this.status = init.status
    this.statusText = init.statusText

    this.trailers = init.trailers

    this.type = null
    this.url = init.url
    this.useFinalURL = true
  }

  clone () {}
  error () {}
  redirect () {}
}

module.exports = Response
