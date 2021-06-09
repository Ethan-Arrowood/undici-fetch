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
  const normalizedHeaderValue = value.replace(/^[\n\t\r\x20]+|[\n\t\r\x20]+$/g, '')
  validateHeaderValue(name, normalizedHeaderValue)
  return normalizedHeaderValue
}

function fill (headers, object) {
  if (Array.isArray(object)) {
    if (Array.isArray(object[0])) {
      for (let i = 0, header = object[0]; i < object.length; i++, header = object[i]) {
        if (header.length !== 2) throw TypeError('header entry must be of length two')
        headers.append(header[0], header[1])
      }
    } else if (typeof object[0] === 'string' || Buffer.isBuffer(object[0])) {
      if (object.length % 2 !== 0) throw TypeError('flattened header init must have even length')
      for (let i = 0; i < object.length; i += 2) {
        headers.append(object[i].toString('utf-8'), object[i + 1].toString('utf-8'))
      }
    } else {
      throw TypeError('invalid array-based header init')
    }
  } else if (kHeaders in object) {
    headers[kHeaders] = new Array(...object[kHeaders])
  } else if (!types.isBoxedPrimitive(object)) {
    for (const [name, value] of Object.entries(object)) {
      headers.append(name, value)
    }
  }
}

// Return position of value or where it should be inserted.
function lowerBound (arr, val) {
  let low = 0
  let high = arr.length / 2

  while (high > low) {
    const mid = (high + low) >>> 1
    if (arr[mid * 2] < val) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low * 2
}

class Headers {
  constructor (init) {
    this[kHeaders] = []

    if (init && typeof init === 'object') {
      fill(this, init)
    }
  }

  append (name, value) {
    const normalizedName = normalizeAndValidateHeaderName(name)
    const normalizedValue = normalizeAndValidateHeaderValue(name, value)

    const i = lowerBound(this[kHeaders], normalizedName)
    if (this[kHeaders][i] === normalizedName) {
      this[kHeaders][i + 1] += `, ${normalizedValue}`
    } else {
      this[kHeaders].splice(i, 0, normalizedName, normalizedValue)
    }
  }

  delete (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    const i = lowerBound(this[kHeaders], normalizedName)
    if (normalizedName === this[kHeaders][i]) {
      this[kHeaders].splice(i, 2)
    }
  }

  get (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    const i = lowerBound(this[kHeaders], normalizedName)
    if (normalizedName === this[kHeaders][i]) {
      return this[kHeaders][i + 1]
    }

    return null
  }

  has (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    const i = lowerBound(this[kHeaders], normalizedName)
    if (normalizedName === this[kHeaders][i]) {
      return true
    }

    return false
  }

  set (name, value) {
    const normalizedName = normalizeAndValidateHeaderName(name)
    const normalizedValue = normalizeAndValidateHeaderValue(name, value)

    const i = lowerBound(this[kHeaders], normalizedName)
    if (this[kHeaders][i] === normalizedName) {
      this[kHeaders][i + 0] = normalizedName
      this[kHeaders][i + 1] = normalizedValue
    } else {
      this[kHeaders].splice(i, 0, normalizedName, normalizedValue)
    }
  }

  * keys () {
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      yield this[kHeaders][i]
    }
  }

  * values () {
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      yield this[kHeaders][i + 1]
    }
  }

  * entries () {
    yield * this
  }

  forEach (callback, thisArg) {
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      callback.call(thisArg, this[kHeaders][i + 1], this[kHeaders][i], this)
    }
  }

  * [Symbol.iterator] () {
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      yield [this[kHeaders][i], this[kHeaders][i + 1]]
    }
  }
}

module.exports = {
  Headers,
  fill,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue
}
