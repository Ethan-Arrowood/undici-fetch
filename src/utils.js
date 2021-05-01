'use strict'
const { Stream } = require('stream')

function isReadable (obj) {
  return obj instanceof Stream && typeof obj._read === 'function' && typeof obj._readableState === 'object'
}

class AbortError extends Error {
  constructor () {
    super('The operation was aborted')
    this.name = 'AbortError'
  }
}

module.exports = {
  AbortError,
  isReadable
}
