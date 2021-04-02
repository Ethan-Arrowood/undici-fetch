'use strict'

const stream = require('stream')

function isReadable (obj) {
  return obj instanceof stream.Stream && typeof obj._read === 'function' && typeof obj._readableState === 'object'
}

function createUndiciRequestOptions (request, signal) {
  return {
    path: request.url.pathname + request.url.search,
    method: request.method,
    body: request.body,
    headers: request.headers,
    signal
  }
}

module.exports = {
  isReadable,
  createUndiciRequestOptions
}
