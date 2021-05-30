'use strict'

const { types } = require('util')
const { validateHeaderName, validateHeaderValue } = require('http')

const { headers: { kHeadersList } } = require('./symbols')

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
    } else if (typeof object[0] === 'string' || Buffer.isBuffer(object[0])) {
      if (object.length % 2 !== 0) throw TypeError('flattened header init must have even length')
      for (let i = 0; i < object.length; i += 2) {
        headers.append(object[i].toString('utf-8'), object[i + 1].toString('utf-8'))
      }
    } else {
      throw TypeError('invalid array-based header init')
    }
  } else if (kHeadersList in object) {
    headers[kHeadersList] = new Array(...object[kHeadersList])
  } else if (!types.isBoxedPrimitive(object)) {
    for (const [name, value] of Object.entries(object)) {
      headers.append(name, value)
    }
  }
}

class Headers {
  constructor (init) {
    this[kHeadersList] = []

    if (init && typeof init === 'object') {
      fill(this, init)
    }
  }

  append (name, value) {
    const [normalizedName, normalizedValue] = normalizeAndValidateHeaderValue(name, value)

    let i = this[kHeadersList].length
    let low = -1
    let probe
    while (i - low > 1) {
      probe = (i + low) >>> 1
      if (this[kHeadersList][probe % 2 ? probe - 1 : probe] < normalizedName) {
        low = probe
      } else {
        i = probe
      }
    }
    if (this[kHeadersList][i] === normalizedName) {
      this[kHeadersList][i + 1] += `, ${normalizedValue}`
    } /* istanbul ignore next */ else if (this[kHeadersList][i - 2] === normalizedName) { // todo: figure out how to reach this branch
      this[kHeadersList][i - 1] += `, ${normalizedValue}`
    } else {
      this[kHeadersList].splice(i, 0, normalizedName, normalizedValue)
    }
  }

  delete (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    for (let i = 0; i < this[kHeadersList].length; i += 2) {
      if (normalizedName === this[kHeadersList][i]) {
        this[kHeadersList].splice(i, 2)
        break
      }
    }
  }

  get (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    for (let i = 0; i < this[kHeadersList].length; i += 2) {
      if (normalizedName === this[kHeadersList][i]) {
        return this[kHeadersList][i + 1]
      }
    }

    return null
  }

  has (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    for (let i = 0; i < this[kHeadersList].length; i += 2) {
      if (normalizedName === this[kHeadersList][i]) {
        return true
      }
    }

    return false
  }

  set (name, value) {
    const [normalizedName, normalizedValue] = normalizeAndValidateHeaderValue(name, value)

    let index = this[kHeadersList].length
    for (let i = 0; i < this[kHeadersList].length; i += 2) {
      if (normalizedName === this[kHeadersList][i] || this[kHeadersList][i] > normalizedName) {
        index = i
        break
      }
    }
    this[kHeadersList].splice(index, 0, normalizedName, normalizedValue)
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
    for (let i = 0; i < this[kHeadersList].length; i += 2) {
      callback.call(thisArg, this[kHeadersList][i + 1], this[kHeadersList][i], this)
    }
  }

  * [Symbol.iterator] () {
    for (let i = 0; i < this[kHeadersList].length; i += 2) {
      yield [this[kHeadersList][i], this[kHeadersList][i + 1]]
    }
  }
}

module.exports = {
  Headers,
  fill,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue
}
