'use strict'

const { types } = require('util')

const { normalizeAndValidateHeaderName, normalizeAndValidateHeaderArguments } = require('./utils')

/**
 * @typedef {[string, string][] | Record<string, string>} HeadersInit
 */

const kHeaders = Symbol('headers')

class Headers {
  /**
   * @param {HeadersInit} [init]
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

  /**
   * @param {string} name 
   * @param {string} value 
   * @returns {void}
   */
  append (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderArguments(name, value)

    const existingHeaderValue = Map.prototype.get.call(this[kHeaders], normalizedHeaderName)
    if (existingHeaderValue) {
      Map.prototype.set.call(this[kHeaders], normalizedHeaderName, existingHeaderValue.concat([normalizedHeaderValue]))
    } else {
      Map.prototype.set.call(this[kHeaders], normalizedHeaderName, [normalizedHeaderValue])
    }
  }

  /**
   * @param {string} name 
   * @returns {void}
   */
  delete (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    Map.prototype.delete.call(this[kHeaders], normalizedHeaderName)
  }

  /**
   * @param {string} name 
   * @returns {string | null}
   */
  get (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    const values = Map.prototype.get.call(this[kHeaders], normalizedHeaderName)
    return values === undefined ? null : values.join(', ')
  }

  /**
   * @param {string} name 
   * @returns {boolean}
   */
  has (name) {
    const normalizedHeaderName = normalizeAndValidateHeaderName(name)

    return Map.prototype.has.call(this[kHeaders], normalizedHeaderName)
  }

  /**
   * @param {string} name 
   * @param {string} value 
   * @returns {void}
   */
  set (name, value) {
    const [normalizedHeaderName, normalizedHeaderValue] = normalizeAndValidateHeaderArguments(name, value)

    Map.prototype.set.call(this[kHeaders], normalizedHeaderName, [normalizedHeaderValue])
  }

  /**
   * @returns {[string, string[]]}
   */
  * [Symbol.iterator] () {
    for (const header of this[kHeaders]) {
      yield header
    }
  }
}

module.exports = Headers
