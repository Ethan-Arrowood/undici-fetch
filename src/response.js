'use strict'
const Body = require('./body')
const Headers = require('./headers')

class Response extends Body {
  constructor (body, init = {}) {
    super(body)

    this.headers = new Headers(init.headers)
    this.ok = this.status >= 200 && this.status <= 299
    this.status = init.status
    this.statusText = init.statusText
    this.type = null
    this.url = init.url
  }

  clone () {
    if (this.bodyUsed) {
      throw TypeError('Cannot clone Response - bodyUsed is true')
    }

    return new Response(this.body, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText,
      url: this.url,
    })
  }

  error () {
    const response = new Response(null)
    response.headers.guard = 'immutable'
    response.type = 'error'
    return response
  }

  redirect (url, status) {
    if (!((status >= 301 && status <= 303) || status === 307 || status === 308)) {
      throw RangeError(`redirect status must be 301, 302, 303, 307, or 308. Found ${status}`)
    }

    const response = new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    })
    response.headers.guard = 'immutable'
    return response
  }
}

module.exports = Response
