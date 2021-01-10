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
        for (const [name, values] of init[kHeaders]) {
          this[kHeaders].set(name, values.slice())
        }
      } else if (!types.isBoxedPrimitive(init)) {
        for (const [name, value] of Object.entries(init)) {
          this.append(name, value)
        }
      }
    }
  }

  append (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderArguments(name, value)

    const existingHeaderValue = (Map.prototype.get.call(this[kHeaders], normalizedHeaderName) || []).slice()
    existingHeaderValue.push(normalizedHeaderValue)
    Map.prototype.set.call(this[kHeaders], normalizedHeaderName, existingHeaderValue)
  }

  delete (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    Map.prototype.delete.call(this[kHeaders], normalizedHeaderName)
  }

  get (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    const values = Map.prototype.get.call(this[kHeaders], normalizedHeaderName)
    return values === undefined ? null : values.join(', ')
  }

  has (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    return Map.prototype.has.call(this[kHeaders], normalizedHeaderName)
  }

  set (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderArguments(name, value)

    Map.prototype.set.call(this[kHeaders], normalizedHeaderName, [normalizedHeaderValue])
  }

  * [Symbol.iterator] () {
    for (const [name, values] of this[kHeaders]) {
      yield [name, values.join(', ')]
    }
  }
}

module.exports = Headers
