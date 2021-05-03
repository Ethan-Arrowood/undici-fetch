'use strict'

function isAsyncIterable (obj) {
  return typeof obj?.[Symbol.asyncIterator] === 'function' || typeof obj?.[Symbol.iterator] === 'function'
}

class AbortError extends Error {
  constructor () {
    super('The operation was aborted')
    this.name = 'AbortError'
  }
}

module.exports = {
  AbortError,
  isAsyncIterable
}
