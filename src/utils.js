'use strict'

const { kData } = require('./symbols')

const { kHeaders } = require('./symbols')

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

// Sorts 1-dimensional headers array by traversing it, from the end, and
// comparing each pair to the previous pair. If the `>` comparison for
// the previous pair is true, remove previous pair, move it to the end,
// and reset the counter so it can restart the traversal and not miss anything
function sort1d (arr) {
  let i = arr.length
  while (i > 0) {
    if (arr[i - 2] > arr[i]) {
      arr.push(...arr.splice(i - 2, 2))
      i = arr.length
    } else {
      i -= 2
    }
  }
  return arr
}

module.exports = {
  sort1d,
  AbortError,
  createUndiciRequestOptions,
  MockReadableStream
}
