'use strict'

const { METHODS } = require('http')

const { Body, extractBody } = require('./body')
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
  }
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

class Request extends Body {
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
    } else if (typeof input !== 'string') {
      throw TypeError('Request input must be type Request or string')
    }

    const parsedURL = new URL(input)

    const normalizedMethod = init.method !== undefined ? normalizeAndValidateRequestMethod(init.method) : 'GET'

    const keepalive = init.keepalive || false

    const body = init.body || null

    if (body !== null) {
      if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') {
        throw TypeError('Request with GET/HEAD method cannot have body')
      }

      const [extractedBody, contentType] = extractBody(body, keepalive)

      super(extractedBody)

      this[kHeaders] = new Headers(init.headers)

      if (contentType !== null && !this[kHeaders].has('content-type')) {
        this[kHeaders].append('content-type', contentType)
      }
    } else {
      super(body)
      this[kHeaders] = new Headers(init.headers)
    }

    this[kUrlList] = [parsedURL]
    this[kRedirect] = init.redirect || 'follow'
    this[kIntegrity] = init.integrity || ''
    this[kKeepalive] = keepalive
    this[kMethod] = normalizedMethod
    this[kSignal] = init.signal || null
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

module.exports = { Request }
