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
    t.plan(1)

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
    t.strictDeepEqual(found, wanted)
  })
})
