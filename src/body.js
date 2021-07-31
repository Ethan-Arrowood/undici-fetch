'use strict'

const { isAsyncIterable } = require('./utils')
const { BodyReadable } = require('undici') // Somehow use BodyReadable

function extractBody (body, keepalive = false) {
  // Test for unique iterator types (URLSearchParams, String, or ArrayBuffer) before the isAsyncIterable check

  // todo: Blob & FormBody

  if (body instanceof URLSearchParams) {
    // spec says to run application/x-www-form-urlencoded on body.list
    // this is implemented in Node.js as apart of an URLSearchParams instance toString method
    // See: https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/lib/internal/url.js#L490
    // And: https://github.com/nodejs/node/blob/e46c680bf2b211bbd52cf959ca17ee98c7f657f5/lib/internal/url.js#L1100
    return [BodyReadable.from(body).toString(), 'application/x-www-form-urlencoded;charset=UTF-8']
  } else if (typeof body === 'string') {
    return [BodyReadable.from(body), 'text/plain;charset=UTF-8']
  } else if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return [BodyReadable.from(body), null]
  } else if (typeof body.bodyUsed === 'boolean') {
    if (keepalive) throw new TypeError('Cannot extract body while keepalive is true')
    return [body, null]
  } else if (isAsyncIterable(body)) { // Readable, Buffer
    if (keepalive) throw new TypeError('Cannot extract body while keepalive is true')
    return [BodyReadable.from(body), null]
  } else {
    throw Error('Cannot extract Body from input: ', body)
  }
}

module.exports = {
  extractBody
}
