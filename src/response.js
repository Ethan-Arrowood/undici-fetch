'use strict'

const Body = require('./body')
const { Headers } = require('./headers')

class Response extends Body {
  constructor (body, init = {}) {
    super(body)

    init = {
      status: init.status || 200,
      statusText: init.statusText || '',
      ...init
    }

    if (typeof init.status !== 'number' || init.status < 200 || init.status > 599) {
      throw RangeError(`Response status must be between 200 and 599 inclusive. Found: ${init.status}`)
    }

    if (typeof init.statusText !== 'string') {
      throw TypeError(`Response statusText must be of type string. Found type: ${typeof init.statusText}`)
    }

    this.headers = new Headers(init.headers)
    this.ok = init.status >= 200 && init.status <= 299
    this.status = init.status
    this.statusText = init.statusText
    this.type = 'default'
  }

  clone () {
    if (this.bodyUsed) {
      throw TypeError('Cannot clone Response - bodyUsed is true')
    }

    return new Response(this.body, {
      headers: Array.from(this.headers.entries()),
      status: this.status,
      statusText: this.statusText,
      url: this.url
    })
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
