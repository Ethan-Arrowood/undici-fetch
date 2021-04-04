'use strict'

const stream = require('stream')

const { kHeaders } = require('./symbols')

function isReadable (obj) {
  return obj instanceof stream.Stream && typeof obj._read === 'function' && typeof obj._readableState === 'object'
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

// Sorts 1-dimensional headers array by traversing it, from the end, and
// comparing it to the previous pair. If the `>` comparison for the previous
// pair is true, remove previous pair, move it to the end, and reset
// the counter so it can restart the traversal and not miss anything
function sort1d (arr) {
  let i = arr.length
  let previous
  while (i) {
    if (arr[i - 2] > arr[i]) {
      previous = arr.splice(i - 2, 2)
      arr.push(...previous)
      i = arr.length
    } else {
      i -= 2
    }
  }
  return arr
}

module.exports = {
  sort1d,
  isReadable,
  AbortError,
  createUndiciRequestOptions
}
