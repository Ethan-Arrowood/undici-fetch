'use strict'

function isAsyncIterable (obj) {
  return typeof obj?.[Symbol.asyncIterator] === 'function' || typeof obj?.[Symbol.iterator] === 'function'
}

function binarySearch (arr, val) {
  let low = 0
  let high = arr.length / 2

  while (high > low) {
    const mid = (high + low) >>> 1

    // TODO: val.localeCompare(arr[mid * 2])
    if (arr[mid * 2] < val) {
      low = mid + 1
    } else {
      high = mid
    }
  }

  return low * 2
}

class AbortError extends Error {
  constructor () {
    super('The operation was aborted')
    this.name = 'AbortError'
  }
}

module.exports = {
  AbortError,
  isAsyncIterable,
  binarySearch
}
