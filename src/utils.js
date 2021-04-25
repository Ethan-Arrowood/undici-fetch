'use strict'

const { kData, kHeaders } = require('./symbols')

class MockReadableStream {
  constructor () {
    this[kData] = []
  }

  * [Symbol.asyncIterator]() {
    yield * this[kData]
  }
}

class AbortError extends Error {
  constructor () {
    super('The operation was aborted')
    this.name = 'AbortError'
  }
}

function createUndiciRequestOptions (request, signal) {
  return {
    path: request.url.pathname + request.url.search,
    method: request.method,
    body: request.body,
    headers: request.headers[kHeaders],
    signal
  }
}

module.exports = {
  AbortError,
  createUndiciRequestOptions,
  MockReadableStream
}
