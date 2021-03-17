'use strict'

const stream = require('stream')

function isReadable (obj) {
  return obj instanceof stream.Stream && typeof obj._read === 'function' && typeof obj._readableState === 'object'
}

module.exports = {
  isReadable
}
