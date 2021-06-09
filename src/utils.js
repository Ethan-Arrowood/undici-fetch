'use strict'

function isAsyncIterable (obj) {
  return typeof obj?.[Symbol.asyncIterator] === 'function' || typeof obj?.[Symbol.iterator] === 'function'
}

/**
 * This algorithm is based off of https://www.tbray.org/ongoing/When/200x/2003/03/22/Binary
 * It only operates on the even indexes of the array (the header names) by only iterating at most
 * half the length of the input array. The search also assumes all entries are strings and uses
 * String.prototype.localeCompare for comparison
 */
function binarySearch (arr, val) {
  let low = 0
  let high = arr.length / 2

  while (high > low) {
    const mid = (high + low) >>> 1

    if (val.localeCompare(arr[mid * 2]) > 0) {
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
