'use strict'

const tap = require('tap')
const stream = require('stream')
const Request = require('../src/request')
const { Headers } = require('../src/headers')
const {
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
