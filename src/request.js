'use strict'

const { METHODS } = require('http')

const Body = require('./body')
const { Headers, fill } = require('./headers')

function normalizeAndValidateRequestMethod (method) {
  if (method === undefined) {
    return 'GET'
  }

  if (typeof method !== 'string') {
    throw TypeError(`Request method: ${method} must be type 'string'`)
  }

  const normalizedMethod = method.toUpperCase()

  if (METHODS.indexOf(normalizedMethod) === -1) {
    throw Error(`Normalized request method: ${normalizedMethod} must be one of \`require('http').METHODS\``)
  }

  return normalizedMethod
}

function RequestCannotHaveBodyError (method) {
  return TypeError(`${method} Request cannot have a body`)
}
function RequestCloneError () {
  return Error('Cannot clone Request - bodyUsed is true')
}

class Request extends Body {
  constructor (input, init = {}) {
    super(init.body)

    if (input instanceof Request) {
      const request = new Request(input.url, {
        method: input.method,
        body: input.body,
        ...init
      })

      fill(request.headers, input.headers)

      return request
    }

    this.url = new URL(input)

    this.method = normalizeAndValidateRequestMethod(init.method)

    this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers)

    if ((this.method === 'GET' || this.method === 'HEAD') && this.body !== null) {
      throw RequestCannotHaveBodyError(this.method)
    }
  }

  clone () {
    if (this.bodyUsed) {
      throw RequestCloneError()
    }

    return new Request(this)
  }
}

module.exports = Request
