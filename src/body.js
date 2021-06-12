'use strict'

const { body: { kBody } } = require('./symbols')
const { isAsyncIterable } = require('./utils')

class ControlledAsyncIterable {
  constructor (input) {
    if (!isAsyncIterable(input)) {
      throw Error('input argument must implement either `[Symbol.asyncIterator]` or `[Symbol.iterator]`')
    }

    this.data = input
    this.disturbed = false
  }

  async * [Symbol.asyncIterator] () {
    if (this.disturbed) {
      throw Error('cannot iterate on distured iterable')
    }

    this.disturbed = true

    yield * this.data
  }
}

function BodyMixin (requestOrResponsePrototype) {
  Object.defineProperties(requestOrResponsePrototype, {
    body: {
      get () { return this[kBody] }
    },
    bodyUsed: {
      get () { return isUnusable(this[kBody]) }
    },
    arrayBuffer: {
      value: function () {
        if (this[kBody] === null) return Promise.resolve(Buffer.alloc(0))

        return consumeBody(this[kBody])
      }
    },
    blob: {
      value: async function () {
        throw Error(`${this.constructor.name}.blob() is not supported yet by undici-fetch`)
      }
    },
    formData: {
      value: async function () {
        throw Error(`${this.constructor.name}.formData() is not supported yet by undici-fetch`)
      }
    },
    json: {
      value: async function () {
        return JSON.parse(await this.text())
      }
    },
    text: {
      value: async function () {
        if (this[kBody] === null) return ''

        return (await consumeBody(this[kBody])).toString('utf-8')
      }
    }
  })
}

async function consumeBody (controlledAsyncIterable) {
  if (isUnusable(controlledAsyncIterable)) throw TypeError('cannot consume unusable body')

  if (Buffer.isBuffer(controlledAsyncIterable.data)) {
    controlledAsyncIterable.disturbed = true
    return controlledAsyncIterable.data
  } else {
    const bufs = []

    for await (const chunk of controlledAsyncIterable) {
      bufs.push(Buffer.from(chunk))
    }

    return Buffer.concat(bufs)
  }
}

function isUnusable (controlledAsyncIterable) {
  return controlledAsyncIterable?.disturbed ?? false
}

function extractBody (body, keepalive = false) {
  // Test for unique iterator types (URLSearchParams, String, or ArrayBuffer) before the isAsyncIterable check

  // todo: Blob & FormBody

  if (body instanceof URLSearchParams) {
    // spec says to run application/x-www-form-urlencoded on body.list
    // this is implemented in Node.js as apart of an URLSearchParams instance toString method
    // See: https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/lib/internal/url.js#L490
    // And: https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/lib/internal/url.js#L1100
    return [
      Buffer.from(body.toString(), 'utf-8'),
      'application/x-www-form-urlencoded;charset=UTF-8'
    ]
  } else if (typeof body === 'string') {
    return [
      Buffer.from(body, 'utf-8'),
      'text/plain;charset=UTF-8'
    ]
  } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return [Buffer.from(body), null]
  } else if (isAsyncIterable(body)) { // Readable, Buffer
    if (keepalive) throw new TypeError('Cannot extract body while keepalive is true')
    return [body, null]
  } else {
    throw Error('Cannot extract Body from input: ', body)
  }
}

module.exports = {
  BodyMixin,
  consumeBody,
  ControlledAsyncIterable,
  extractBody,
  isUnusable
}
