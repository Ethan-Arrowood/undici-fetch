'use strict'

const tap = require('tap')
const stream = require('stream')
const Request = require('../src/request')

const {
  sort1d,
  isReadable,
  createUndiciRequestOptions
} = require('../src/utils')

tap.test('isReadable', t => {
  t.plan(4)

  t.ok(isReadable(new stream.Readable()))
  t.ok(isReadable(new stream.Duplex()))
  t.notOk(isReadable(new stream.Writable()))
  t.notOk(isReadable(new stream.Stream()))
})

tap.test('createUndiciRequestOptions', t => {
  t.plan(1)

  t.test('handles GET request with query string', t => {
    t.plan(1)

    const origin = 'https://example.com'
    const path = '/My%20Folder/index.html?foo=bar&Hello%20World=Hi%20There%3F'
    const url = origin + path
    const request = new Request(url)
    const signal = undefined

    const found = createUndiciRequestOptions(request, signal)
    const wanted = {
      method: 'GET',
      path,
      headers: [],
      body: null,
      signal
    }

    t.strictDeepEqual(found, wanted)
  })
})

tap.test('sort1d', t => {
  t.plan(1)

  t.test('correctly sorts 1-dimensional header arrays', t => {
    t.plan(2)

    function legacySort1d (headers) {
      const namesAndOriginalIndex = []
      // O(n)
      for (let i = 0; i < headers.length; i += 2) {
        namesAndOriginalIndex.push([headers[i], i])
      }
      // O(n log n)
      namesAndOriginalIndex.sort((a, b) => {
        const nameA = a[0]
        const nameB = b[0]
        if (nameA < nameB) {
          return -1
        } else if (nameA > nameB) {
          return 1
        } else {
          return 0
        }
      })
      const sorted = []
      // O(n/2)
      for (const [name, index] of namesAndOriginalIndex) {
        sorted.push(name)
        sorted.push(headers[index + 1])
      }
      return sorted
    }

    const wanted = [
      'header-1',
      'value',
      'header-5',
      'value',
      'header-a',
      'value',
      'header-b',
      'value',
      'header-c',
      'value',
      'header-d',
      'value',
      'header-e',
      'value',
      'header-f',
      'value'
    ]
    const arr1d = [
      'header-c',
      'value',
      'header-a',
      'value',
      'header-b',
      'value',
      'header-5',
      'value',
      'header-e',
      'value',
      'header-d',
      'value',
      'header-f',
      'value',
      'header-1',
      'value'
    ]
    const found = sort1d(arr1d)
    const legacyFound = legacySort1d(arr1d)
    t.strictDeepEqual(found, wanted)
    t.strictDeepEqual(found, legacyFound)
  })
})
