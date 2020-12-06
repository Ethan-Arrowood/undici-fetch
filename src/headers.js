'use strict'

const { types } = require('util')

function validateHeaderName (name) {
  if (!name || name.length === 0) throw TypeError(`Invalid header name ${name}`)

  for (let i = 0, cc = name.charCodeAt(0); i < name.length; i++, cc = name.charCodeAt(i)) {
    if (
    // check most common characters first
      (cc <= 97 || cc >= 122) && // a-z
      (cc <= 65 || cc >= 90) && // A-z
      cc !== 45 && // -
      cc !== 33 && // !
      (cc <= 35 || cc >= 39) && // # $ % & '
      cc !== 42 && // *
      cc !== 43 && // +
      cc !== 46 && // .
      (cc <= 48 || cc >= 57) && // 0-9
      (cc <= 94 || cc >= 96) && // ^ _ `
      cc !== 124 && // |
      cc !== 126 // ~
    ) {
      throw TypeError(`Invalid header name ${name}`)
    } else {
      continue
    }
  }
}

function validateHeaderValue (name, value) {
  if (!value || value.length === 0) throw TypeError(`Invalid value ${value} for header ${name}`)

  for (let i = 0, cc = value.charCodeAt(0); i < value.length; i++, cc = value.charCodeAt(i)) {
    if ((cc >= 32 && cc <= 126) || (cc >= 128 && cc <= 255) || cc === 9) {
      continue
    } else {
      throw TypeError(`Invalid value ${value} for header ${name}`)
    }
  }
}

function normalize (header) {
  return header.trim()
}

function isForbiddenHeaderName (name) {
  return (
    name === 'accept-charset' ||
    name === 'accept-encoding' ||
    name === 'access-control-request-headers' ||
    name === 'access-control-request-method' ||
    name === 'connection' ||
    name === 'content-length' ||
    name === 'cookie' ||
    name === 'cookie2' ||
    name === 'data' ||
    name === 'dnt' ||
    name === 'expect' ||
    name === 'host' ||
    name === 'keep-alive' ||
    name === 'origin' ||
    name === 'referer' ||
    name === 'te' ||
    name === 'trailer' ||
    name === 'transfer-encoding' ||
    name === 'upgrade' ||
    name === 'via' ||
    String.prototype.includes.call(name, 'proxy-') ||
    String.prototype.includes.call(name, 'sec-')
  )
}

function isForbiddenResponseHeaderName (name) {
  return (
    name === 'set-cookie' ||
    name === 'set-cookie2'
  )
}

const kHeadersList = Symbol('headers list')

class Headers {
  constructor (init) {
    this[kHeadersList] = {}
    this.guard = 'none'
    if (init) {
      if (Array.isArray(init)) {
        for (let i = 0, header = init[0]; i < init.length; i++, header = init[i]) {
          if (header.length !== 2) throw TypeError('header entry must be of length two')
          this.append(header[0], header[1])
        }
      } else if (typeof init === 'object' && !types.isBoxedPrimitive(init)) {
        for (const [name, value] of Object.entries(init)) {
          this.append(name, value)
        }
      }
    }
  }

  append (_name, _value) {
    const name = _name.toLowerCase()
    validateHeaderName(name)
    const value = normalize(_value)
    validateHeaderValue(value)

    if (this.guard === 'immutable') {
      throw TypeError('headers instance is immutable')
    } else if (this.guard === 'request' && isForbiddenHeaderName(name)) {
      return
    } else if (this.guard === 'response' && isForbiddenResponseHeaderName(name)) {
      return
    }

    if (Object.prototype.hasOwnProperty.call(this.headersList, name)) {
      this[kHeadersList][name].push(value)
    } else {
      this[kHeadersList][name] = [value]
    }
  }

  delete (_name) {
    const name = _name.toLowerCase()
    validateHeaderName(name)

    if (this.guard === 'immutable') {
      throw TypeError('headers instance is immutable')
    } else if (this.guard === 'request' && isForbiddenHeaderName(name)) {
      return
    } else if (this.guard === 'response' && isForbiddenResponseHeaderName(name)) {
      return
    }

    if (!Object.prototype.hasOwnProperty.call(this.headersList, name)) {
      return
    }

    delete this[kHeadersList][name]
  }

  get (_name) {
    const name = _name.toLowerCase()
    validateHeaderName(name)

    const values = this[kHeadersList][name]
    return values === undefined ? null : values.join(', ')
  }

  has (_name) {
    const name = _name.toLowerCase()
    validateHeaderName(name)

    return Object.prototype.hasOwnProperty.call(this.headersList, name)
  }

  set (_name, _value) {
    const name = _name.toLowerCase()
    validateHeaderName(name)
    const value = normalize(_value)
    validateHeaderValue(value)

    if (this.guard === 'immutable') {
      throw TypeError('headers instance is immutable')
    } else if (this.guard === 'request' && isForbiddenHeaderName(name)) {
      return
    } else if (this.guard === 'response' && isForbiddenResponseHeaderName(name)) {
      return
    }

    this[kHeadersList][name] = value
  }

  * [Symbol.iterator] () {
    for (const header of Object.entries(this[kHeadersList])) {
      yield header
    }
  }
}

module.exports = Headers
