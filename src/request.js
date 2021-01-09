'use strict'

const { METHODS } = require('http')

const Body = require('./body')
const Headers = require('./headers')

/**
 * @typedef RequestInit
 * @property {string} [method] - Defaults to 'GET'
 * @property {Headers | import('./headers').HeadersInit} [headers]
 * @property {import('./body').BodyInput} [body]
 */

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
  /**
   * @param {Request | string} input 
   * @param {RequestInit} [init]
   */
  constructor (input, init = {}) {
    super(init.body)

    if (input instanceof Request) {
      return new Request(input.url, {
        method: input.method,
        headers: input.headers,
        body: input.body,
        ...init
      })
    }

    this.url = new URL(input)

    this.method = normalizeAndValidateRequestMethod(init.method)

    this.headers = init.headers instanceof Headers ? init.headers : new Headers(init.headers)

    if ((this.method === 'GET' || this.method === 'HEAD') && this.body !== null) {
      throw RequestCannotHaveBodyError(this.method)
    }
  }

  /**
   * @returns {Request}
   */
  clone () {
    if (this.bodyUsed) {
      throw RequestCloneError()
    }

    return new Request(this)
  }
}

module.exports = Request
