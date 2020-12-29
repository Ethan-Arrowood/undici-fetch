'use strict'

const { types } = require('util')

function validateHeaderName (name) {
  if (!name || name.length === 0) throw TypeError(`Invalid header name ${name}`)

  for (let i = 0, cc = name.charCodeAt(0); i < name.length; i++, cc = name.charCodeAt(i)) {
    if (
    // check most common characters first
      (cc >= 97 && cc <= 122) || // a-z
      (cc >= 65 && cc <= 90) || // A-z
      cc === 45 || // -
      cc === 33 || // !
      (cc >= 35 && cc <= 39) || // # $ % & '
      cc === 42 || // *
      cc === 43 || // +
      cc === 46 || // .
      (cc >= 48 && cc <= 57) || // 0-9
      (cc >= 94 && cc <= 96) || // ^ _ `
      cc === 124 || // |
      cc === 126 // ~
    ) {
      continue
    } else {
      throw TypeError(`Invalid header name ${name}`)
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

function normalizeAndValidateArguments(name, value) {
  const normalizedHeaderName = name.toLowerCase()
  validateHeaderName(normalizedHeaderName)

  if (value) {
    const normalizedHeaderValue = value.trim()
    validateHeaderValue(normalizedHeaderName, normalizedHeaderValue)

    return [normalizedHeaderName, normalizedHeaderValue]
  }

  return normalizedHeaderName
}

const kHeaders = Symbol('headers')

class Headers {
  /**
   * 
   * @param {[string, string][] | Record<string, string>} init Initial header list to be cloned into the new instance
   */
  constructor (init) {
    this[kHeaders] = new Map()

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

  append (name, value) {
    const [ normalizedHeaderName, normalizedHeaderValue ] = normalizeAndValidateArguments(name, value)

    const existingHeaderValue = Map.prototype.get.call(this[kHeaders], normalizedHeaderName)
    if (existingHeaderValue) {
      Map.prototype.set.call(this[kHeaders], normalizedHeaderName, existingHeaderValue.concat([normalizedHeaderValue]))
    } else {
      Map.prototype.set.call(this[kHeaders], normalizedHeaderName, [normalizedHeaderValue])
    }
  }

  delete (name) {
    const normalizedHeaderName = normalizeAndValidateArguments(name)

    Map.prototype.delete.call(this[kHeaders], normalizedHeaderName)
  }

  get (name) {
    const normalizedHeaderName = normalizeAndValidateArguments(name)

    const values = Map.prototype.get.call(this[kHeaders], normalizedHeaderName)
    return values === undefined ? null : values.join(', ')
  }

  has (name) {
    const normalizedHeaderName = normalizeAndValidateArguments(name)

    return Map.prototype.has.call(this[kHeaders], normalizedHeaderName)
  }

  set (name, value) {
    const [ normalizedHeaderName, normalizedHeaderValue ] = normalizeAndValidateArguments(name, value)

    Map.prototype.set.call(this[kHeaders], normalizedHeaderName, normalizedHeaderValue)
  }

  * [Symbol.iterator] () {
    for (const header of this[kHeaders]) {
      yield header
    }
  }
}

module.exports = Headers
