'use strict'

const { types } = require('util')
const { validateHeaderName, validateHeaderValue } = require('http')
const { binarySearch } = require('./utils')
const { headers: { kHeadersList } } = require('./symbols')

function normalizeAndValidateHeaderName (name) {
  const normalizedHeaderName = name.toLowerCase()
  validateHeaderName(normalizedHeaderName)
  return normalizedHeaderName
}

const headerRegex = /^[\n\t\r\x20]+|[\n\t\r\x20]+$/g

function normalizeAndValidateHeaderValue (name, value) {
  if (Array.isArray(value)) {
    const normalizedHeaderValues = []
    for (let i = 0; i < value.length; i++) {
      if (typeof value[i] !== 'string') throw TypeError('all headers must be strings')

      const normalized = value[i].replace(headerRegex, '')
      validateHeaderValue(name, normalized)
      normalizedHeaderValues.push(normalized)
    }

    return normalizedHeaderValues
  }

  const normalizedHeaderValue = value.replace(headerRegex, '')
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
      if (object.length !== 0) throw TypeError('invalid array-based header init')
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
    const normalizedName = normalizeAndValidateHeaderName(name)
    const normalizedValue = normalizeAndValidateHeaderValue(name, value)

    const i = binarySearch(this[kHeadersList], normalizedName)

    if (this[kHeadersList][i] === normalizedName) {
      this[kHeadersList][i + 1] += `, ${normalizedValue}`
    } else {
      this[kHeadersList].splice(i, 0, normalizedName, normalizedValue)
    }
  }

  delete (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    const i = binarySearch(this[kHeadersList], normalizedName)

    if (this[kHeadersList][i] === normalizedName) {
      this[kHeadersList].splice(i, 2)
    }
  }

  get (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    let i = binarySearch(this[kHeadersList], normalizedName)

    if (this[kHeadersList][i] === normalizedName) {
      const all = []
      while (this[kHeadersList][i] === normalizedName) {
        all.push(this[kHeadersList][i + 1])
        i += 2
      }

      return all.join(',')
    }

    return null
  }

  has (name) {
    const normalizedName = normalizeAndValidateHeaderName(name)

    const i = binarySearch(this[kHeadersList], normalizedName)

    return this[kHeadersList][i] === normalizedName
  }

  set (name, value) {
    const normalizedName = normalizeAndValidateHeaderName(name)
    const normalizedValue = normalizeAndValidateHeaderValue(name, value)

    const i = binarySearch(this[kHeadersList], normalizedName)
    if (this[kHeadersList][i] === normalizedName) {
      this[kHeadersList][i + 1] = normalizedValue
    } else {
      this[kHeadersList].splice(i, 0, normalizedName, normalizedValue)
    }
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
      const value = this[kHeadersList][i + 1]
      console.log(value)
      yield [this[kHeadersList][i], Array.isArray(value) ? value.join(',') : value]
    }
  }
}

module.exports = {
  Headers,
  fill,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue
}
