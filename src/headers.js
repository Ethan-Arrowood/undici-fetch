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
    if (Array.isArray(object[0])) {
      for (let i = 0, header = object[0]; i < object.length; i++, header = object[i]) {
        if (header.length !== 2) throw TypeError('header entry must be of length two')
        headers.append(header[0], header[1])
      }
    } else if (typeof object[0] === 'string') {
      if (object.length % 2 !== 0) throw TypeError('flattened header init must have even length')
      for (let i = 0; i < object.length; i += 2) {
        headers.append(object[i], object[i + 1])
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

class Headers {
  constructor (init) {
    this[kHeaders] = []

    if (init && typeof init === 'object') {
      fill(this, init)
    }
  }

  append (name, value) {
    const [normalizedName, normalizedValue] = normalizeAndValidateHeaderValue(name, value)

    let i = this[kHeaders].length
    let low = -1
    let probe
    while (i - low > 1) {
      probe = (i + low) >>> 1
      if (this[kHeaders][probe % 2 ? probe - 1 : probe] < normalizedName) {
        low = probe
      } else {
        i = probe
      }
    }
    if (this[kHeaders][i] === normalizedName) {
      this[kHeaders][i + 1] += `, ${normalizedValue}`
    } else if (this[kHeaders][i - 2] === normalizedName) {
      this[kHeaders][i - 1] += `, ${normalizedValue}`
    } else {
      this[kHeaders].splice(i, 0, normalizedName, normalizedValue)
    }
  }

  delete (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    for (let i = 0; i < this[kHeaders].length; i += 2) {
      if (normalizedName === this[kHeaders][i]) {
        this[kHeaders].splice(i, 2)
        break
      }
    }
  }

  get (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    for (let i = 0; i < this[kHeaders].length; i += 2) {
      if (normalizedName === this[kHeaders][i]) {
        return this[kHeaders][i + 1]
      }
    }

    return null
  }

  has (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    for (let i = 0; i < this[kHeaders].length; i += 2) {
      if (normalizedName === this[kHeaders][i]) {
        return true
      }
    }

    return false
  }

  set (name, value) {
    const [normalizedName, normalizedValue] = normalizeAndValidateHeaderValue(name, value)

    let index = this[kHeaders].length
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      if (normalizedName === this[kHeaders][i] || this[kHeaders][i] > normalizedName) {
        index = i
        break
      }
    }
    this[kHeaders].splice(index, 0, normalizedName, normalizedValue)
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
