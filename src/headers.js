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

    let isNewEntry = true
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      if (normalizedName === this[kHeaders][i]) {
        this[kHeaders][i + 1] += `, ${normalizedValue}`
        isNewEntry = false
        break
      }
    }

    if (isNewEntry) {
      this[kHeaders].push(normalizedName)
      this[kHeaders].push(normalizedValue)
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

    let isNewEntry = true
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      if (normalizedName === this[kHeaders][i]) {
        this[kHeaders][i + 1] = normalizedValue
        isNewEntry = false
        break
      }
    }

    if (isNewEntry) {
      this[kHeaders].push(normalizedName)
      this[kHeaders].push(normalizedValue)
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
    this[kHeaders] = sort(this[kHeaders])
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      callback.call(thisArg, this[kHeaders][i + 1], this[kHeaders][i], this)
    }
  }

  * [Symbol.iterator] () {
    this[kHeaders] = sort(this[kHeaders])
    for (let i = 0; i < this[kHeaders].length; i += 2) {
      yield [this[kHeaders][i], this[kHeaders][i + 1]]
    }
  }
}

function sort (headers) {
  const namesAndOriginalIndex = []
  // O(n)
  for (let i = 0; i < headers.length; i += 2) {
    namesAndOriginalIndex.push([headers[i], i])
  }
  // O(n log n)
  namesAndOriginalIndex.sort((a, b) => {
    const nameA = a[0]
    const nameB = b[0]
    if (nameA < nameB) {
      return -1
    } else if (nameA > nameB) {
      return 1
    } else {
      return 0
    }
  })
  const sorted = []
  // O(n/2)
  for (const [name, index] of namesAndOriginalIndex) {
    sorted.push(name)
    sorted.push(headers[index + 1])
  }
  return sorted
}

module.exports = {
  Headers,
  fill,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue
}
