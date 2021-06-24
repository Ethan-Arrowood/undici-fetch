'use strict'

const { METHODS } = require('http')

const { ControlledAsyncIterable, BodyMixin, extractBody } = require('./body')
const { Headers } = require('./headers')

const {
  request: {
    kMethod,
    kRedirect,
    kIntegrity,
    kKeepalive,
    kSignal
  },
  headers: {
    kHeadersList
  },
  shared: {
    kHeaders,
    kUrlList
  },
  body: { kBody }
} = require('./symbols')

function normalizeAndValidateRequestMethod (method) {
  if (typeof method !== 'string') {
    throw TypeError(`Request method: ${method} must be type 'string'`)
  }

  const normalizedMethod = method.toUpperCase()

  if (METHODS.indexOf(normalizedMethod) === -1) {
    throw Error(`Normalized request method: ${normalizedMethod} must be one of ${METHODS.join(', ')}`)
  }

  return normalizedMethod
}

class Request {
  constructor (input, init = {}) {
    if (input instanceof Request) {
      return new Request(input.url, {
        method: input.method,
        keepalive: input.keepalive,
        headers: input.headers[kHeadersList],
        redirect: input.redirect,
        integrity: input.integrity,
        body: null, // cloning body currently not-supported
        signal: null, // cloning signal currently not-supported
        ...init
      })
    } else if (typeof input !== 'string' && !(input instanceof URL)) {
      throw TypeError('Request input must be type Request, URL, or string')
    }

    this[kUrlList] = [new URL(input)]
    this[kKeepalive] = init.keepalive || false
    this[kRedirect] = init.redirect || 'follow'
    this[kIntegrity] = init.integrity || ''
    this[kSignal] = init.signal || null

    this[kMethod] = init.method !== undefined ? normalizeAndValidateRequestMethod(init.method) : 'GET'
    this[kHeaders] = new Headers(init.headers)
    this[kBody] = init.body || null

    if (this[kBody] !== null) {
      if (this[kMethod] === 'GET' || this[kMethod] === 'HEAD') {
        throw TypeError('Request with GET/HEAD method cannot have body')
      }

      const [extractedBody, contentType] = extractBody(this[kBody], this[kKeepalive])

      this[kBody] = new ControlledAsyncIterable(extractedBody)

      if (contentType !== null && !this[kHeaders].has('content-type')) {
        this[kHeaders].append('content-type', contentType)
      }
    }
  }

  get method () {
    return this[kMethod]
  }

  get url () {
    return this[kUrlList][0].toString()
  }

  get headers () {
    return this[kHeaders]
  }

  get redirect () {
    return this[kRedirect]
  }

  get integrity () {
    return this[kIntegrity]
  }

  get keepalive () {
    return this[kKeepalive]
  }

  get signal () {
    return this[kSignal]
  }

  clone () {
    if (this.bodyUsed) {
      throw TypeError('Cannot clone a Request with an unusable body')
    }

    const request = new Request(this)

    return request
  }
}

BodyMixin(Request.prototype)

module.exports = { Request }
