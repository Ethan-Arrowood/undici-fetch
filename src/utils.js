'use strict'

function isAsyncIterable (obj) {
  return typeof obj?.[Symbol.asyncIterator] === 'function' || typeof obj?.[Symbol.iterator] === 'function'
}

function binarySearch (list, target) {
  if (list.length % 2 !== 0) throw Error('List length must be even')

  function _binarySearch (left, right) {
    if (left > right) return left

    const m = Math.floor((left + right) / 2)
    const mid = m % 2 === 0 ? m : m + 1

    const comparison = target.localeCompare(list[mid])

    if (comparison > 0) {
      return _binarySearch(mid + 2, right)
    } else if (comparison < 0) {
      return _binarySearch(left, mid - 2)
    } else {
      return mid
    }
  }

  return _binarySearch(0, list.length - 2)
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
