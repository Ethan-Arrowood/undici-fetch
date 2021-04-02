'use strict'

const { types } = require('util')
const { validateHeaderName, validateHeaderValue } = require('http')

const { kHeaders } = require('./symbols')

function normalizeAndValidateHeaderName (name) {
  const normalizedHeaderName = name.toLowerCase()
  validateHeaderName(normalizedHeaderName)
  return normalizedHeaderName
}

function normalizeAndValidateHeaderValue (name, value) {
  const normalizedHeaderName = normalizeAndValidateHeaderName(name)
  const normalizedHeaderValue = value.replace(/^[\n\t\r\x20]+|[\n\t\r\x20]+$/g, '')
  validateHeaderValue(normalizedHeaderName, normalizedHeaderValue)
  return [normalizedHeaderName, normalizedHeaderValue]
}

function fill (headers, object) {
  if (Array.isArray(object)) {
    for (let i = 0, header = object[0]; i < object.length; i++, header = object[i]) {
      if (header.length !== 2) throw TypeError('header entry must be of length two')
      headers.append(header[0], header[1])
    }
  } else if (!types.isBoxedPrimitive(object)) {
    for (const [name, value] of Object.entries(object)) {
      headers.append(name, value)
    }
  }
}

class Headers {
  constructor (init) {
    this[kHeaders] = new Map()

    if (init && typeof init === 'object') {
      fill(this, init)
    }
  }

  append (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderValue(name, value)

    const existing = this[kHeaders].get(normalizedHeaderName)
    const newHeaderValue = existing ? existing + ', ' + normalizedHeaderValue : normalizedHeaderValue
    this[kHeaders].set(normalizedHeaderName, newHeaderValue)
  }

  delete (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    this[kHeaders].delete(normalizedHeaderName)
  }

  get (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    const value = this[kHeaders].get(normalizedHeaderName)
    return value === undefined ? null : value
  }

  has (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    return this[kHeaders].has(normalizedHeaderName)
  }

  set (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderValue(name, value)

    this[kHeaders].set(normalizedHeaderName, normalizedHeaderValue)
  }

  * keys () {
    yield * Array.from(this[kHeaders].keys()).sort()
  }

  * values () {
    for (const header of this.entries()) {
      yield header[1]
    }
  }

  * entries () {
    yield * Array.from(this[kHeaders].entries()).sort()
  }

  forEach (callback, thisArg) {
    for (const [key, value] of this) {
      callback.call(thisArg, value, key, this)
    }
  }

  [Symbol.iterator] () {
    return this.entries()
  }
}

module.exports = {
  Headers,
  fill,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue
}
