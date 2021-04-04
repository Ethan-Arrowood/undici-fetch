'use strict'

const Body = require('./body')
const { Headers, fill } = require('./headers')

class Response extends Body {
  constructor (body, { status = 200, statusText = '', headers } = {}) {
    if (typeof status !== 'number' || status < 200 || status > 599) {
      throw RangeError(`Response status must be between 200 and 599 inclusive. Found: ${init.status}`)
    }

    if (typeof statusText !== 'string') {
      throw TypeError(`Response statusText must be of type string. Found type: ${typeof init.statusText}`)
    }

    super(body)

    this.headers = new Headers(headers)
    this.ok = status >= 200 && status <= 299
    this.status = status
    this.statusText = statusText
    this.type = 'default'
  }

  clone () {
    if (this.bodyUsed) {
      throw TypeError('Cannot clone Response - bodyUsed is true')
    }

    const response = new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      url: this.url
    })

    fill(response.headers, this.headers)

    return response
  }

  static error () {
    const response = new Response(null)
    response.type = 'error'
    return response
  }

  static redirect (url, status) {
    if (!((status >= 301 && status <= 303) || status === 307 || status === 308)) {
      throw RangeError(`redirect status must be 301, 302, 303, 307, or 308. Found ${status}`)
    }

    const response = new Response(null, {
      headers: {
        location: new URL(url).toString()
      },
      status
    })

    return response
  }
}

module.exports = Response
