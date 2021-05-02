'use strict'

const tap = require('tap')
const { Readable } = require('stream')

const Request = require('../src/request')
const { Headers } = require('../src/headers')

const validURL = 'http://undici-fetch.dev'

tap.test('Request initialization', t => {
  t.plan(7)

  t.throws(() => new Request(), 'throws on missing input')
  t.doesNotThrow(() => new Request(validURL), 'not throws on valid url input')

  t.test('default method to GET', t => {
    t.plan(1)

    const request = new Request(validURL)
    t.equal(request.method, 'GET')
  })

  t.test('normalize and validate method input', t => {
    t.plan(4)

    t.throws(() => new Request(validURL, { method: 'INVALID-METHOD' }), 'throws on invalid method value')
    t.throws(() => new Request(validURL, { method: 0 }), 'throws on invalid method type')
    t.doesNotThrow(() => new Request(validURL, { method: 'get' }), 'not throws on non-normalized method')
    t.doesNotThrow(() => new Request(validURL, { method: 'GET' }), 'not throws on normalized and valid method')
  })

  t.test('validate GET and HEAD requests', t => {
    t.plan(4)

    t.throws(() => new Request(validURL, { body: new Readable() }), 'throws when body present and method defaults to GET')
    t.throws(() => new Request(validURL, { method: 'GET', body: new Readable() }), 'throws when body present and method is GET')
    t.throws(() => new Request(validURL, { method: 'HEAD', body: new Readable() }), 'throws when body present and method is HEAD')
    t.doesNotThrow(() => new Request(validURL, { method: 'POST', body: new Readable() }), 'not throws when body present and method is not GET or HEAD')
  })

  t.test('new request inherits from request input', { only: true }, t => {
    t.plan(6)

    const request1 = new Request(validURL, { headers: [['undici', 'fetch']] })
    const request2 = new Request(request1)
    t.strictSame(request1, request2)
    t.same(request1.headers, request2.headers)
    const request3 = new Request(request1, { method: 'POST' })
    t.strictSame(request1.url, request3.url)
    t.strictSame(request1.headers, request3.headers)
    t.not(request1.method, request3.method)
    t.equal(request3.method, 'POST')
  })

  t.test('can be instantiated using an existing headers instance', t => {
    t.plan(1)

    const headers = new Headers([['undici', 'fetch']])
    const request = new Request(validURL, { headers })
    t.strictSame(headers, request.headers)
  })
})

tap.test('Request clone', t => {
  t.plan(2)

  t.test('returns new request instance when bodyUsed is false', t => {
    t.plan(1)
    const request1 = new Request(validURL, { headers: [['undici', 'fetch']] })
    const request2 = request1.clone()
    t.strictSame(request1, request2)
  })

  t.test('throwss error if bodyUsed is true', async t => {
    t.plan(1)
    const request = new Request(
      validURL,
      {
        method: 'POST',
        body: Readable.from('undici-fetch', { objectMode: false })
      }
    )
    await request.text()
    t.throws(() => request.clone())
  })
})
