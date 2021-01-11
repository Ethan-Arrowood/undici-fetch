'use strict'

const { types } = require('util')

const { normalizeAndValidateHeaderName, normalizeAndValidateHeaderArguments } = require('./utils')

const kHeaders = Symbol('headers')

class Headers {
  constructor (init) {
    this[kHeaders] = new Map()

    if (init && typeof init === 'object') {
      if (Array.isArray(init)) {
        for (let i = 0, header = init[0]; i < init.length; i++, header = init[i]) {
          if (header.length !== 2) throw TypeError('header entry must be of length two')
          this.append(header[0], header[1])
        }
      } else if (kHeaders in init) {
        this[kHeaders] = new Map(init[kHeaders])
      } else if (!types.isBoxedPrimitive(init)) {
        for (const [name, value] of Object.entries(init)) {
          this.append(name, value)
        }
      }
    }
  }

  append (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderArguments(name, value)

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
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderArguments(name, value)

    this[kHeaders].set(normalizedHeaderName, normalizedHeaderValue)
  }

  keys () {
    return this[kHeaders].keys()
  }

  values () {
    return this[kHeaders].values()
  }

  entries () {
    return this[kHeaders].entries()
  }

  [Symbol.iterator] () {
    return this[kHeaders][Symbol.iterator]()
  }
}

module.exports = Headers
