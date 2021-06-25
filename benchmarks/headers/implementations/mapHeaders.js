'use strict'

const { validateHeaderName, validateHeaderValue } = require('http')
const kHeaders = Symbol('headers')

function normalizeAndValidateHeaderName (name) {
  const normalizedHeaderName = name.toLowerCase()
  validateHeaderName(normalizedHeaderName)
  return normalizedHeaderName
}

function normalizeAndValidateHeaderValue (name, value) {
  const normalizedHeaderValue = value.replace(/^[\n\t\r\x20]+|[\n\t\r\x20]+$/g, '')
  validateHeaderValue(name, normalizedHeaderValue)
  return normalizedHeaderValue
}

class Headers {
  constructor () {
    this[kHeaders] = new Map()
  }

  append (name, value) {
    const normalizedName = normalizeAndValidateHeaderName(name)
    const normalizedValue = normalizeAndValidateHeaderValue(name, value)

    const existingHeader = this[kHeaders].get(normalizedName)
    this[kHeaders].set(normalizedName,
      existingHeader ? `${existingHeader}, ${normalizedValue}` : normalizedValue)
  }

  delete (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    this[kHeaders].delete(normalizedName)
  }

  get (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    return this[kHeaders].get(normalizedName) ?? null
  }

  has (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    return this[kHeaders].has(normalizedName)
  }

  set (name, value) {
    const normalizedName = normalizeAndValidateHeaderName(name)
    const normalizedValue = normalizeAndValidateHeaderValue(name, value)

    this[kHeaders].set(normalizedName, normalizedValue)
  }

  * keys () {
    for (const header of this) {
      yield header[0]
    }
  }

  * values () {
    for (const header of this) {
      yield header[1]
    }
  }

  * entries () {
    const headers = Array.from(this[kHeaders])
    headers.sort((header1, header2) => header1[0].localeCompare(header2[0]))
    yield * headers
  }

  forEach (callback, thisArg) {
    for (const header of this) {
      callback.call(thisArg, header[1], header[0], this)
    }
  }

  * [Symbol.iterator] () {
    yield * this.entries()
  }
}

module.exports = {
  Headers
}
