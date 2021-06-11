'use strict'

const tap = require('tap')

const { Response } = require('../src/response')
const { Headers } = require('../src/headers')
const { shared: { kUrlList } } = require('../src/symbols')

tap.test('Response class initialization', t => {
  t.plan(8)

  t.test('throws type error when status is not a number', t => {
    t.plan(3)
    t.throws(
      () => new Response(null, { status: 'not a number' }),
      'Response status must be of type number. Found type: string'
    )
    t.throws(
      () => new Response(null, { status: false }),
      'Response status must be of type number. Found type: boolean'
    )
    t.throws(
      () => new Response(null, { status: {} }),
      'Response status must be of type number. Found type: object'
    )
  })

  t.test('throws range error when status is out of range', t => {
    t.plan(3)
    t.throws(
      () => new Response(null, { status: 0 }),
      'Response status must be between 200 and 599 inclusive. Found: 0'
    )
    t.throws(
      () => new Response(null, { status: 1000 }),
      'Response status must be between 200 and 599 inclusive. Found: 1000'
    )
    t.throws(
      () => new Response(null, { status: -1 }),
      'Response status must be between 200 and 599 inclusive. Found: -1'
    )
  })

  t.test('throws type error when statusText is not a string', t => {
    t.plan(3)
    t.throws(
      () => new Response(null, { statusText: 0 }),
      'Response statusText must be of type string. Found type: number'
    )
    t.throws(
      () => new Response(null, { statusText: false }),
      'Response statusText must be of type string. Found type: boolean'
    )
    t.throws(
      () => new Response(null, { statusText: {} }),
      'Response statusText must be of type string. Found type: object'
    )
  })

  t.test('throws type error when body is defined with null body status', t => {
    t.plan(3)
    t.throws(
      () => new Response('undici-fetch', { status: 204 }),
      'Expected non-null Response body status. Found: 204'
    )
    t.throws(
      () => new Response('undici-fetch', { status: 205 }),
      'Expected non-null Response body status. Found: 205'
    )
    t.throws(
      () => new Response('undici-fetch', { status: 304 }),
      'Expected non-null Response body status. Found: 304'
    )
  })

  t.test('extracts body and content type', t => {
    t.plan(6)

    t.test('URLSearchParams', async t => {
      const response = new Response(new URLSearchParams('undici=fetch&fetch=undici'))

      t.equal(await response.text(), 'undici=fetch&fetch=undici')
      t.equal(response.headers.get('content-type'), 'application/x-www-form-urlencoded;charset=UTF-8')

      t.end()
    })

    t.test('string', async t => {
      const response = new Response('undici-fetch')

      t.equal(await response.text(), 'undici-fetch')
      t.equal(response.headers.get('content-type'), 'text/plain;charset=UTF-8')

      t.end()
    })

    function * gen () { yield 'undici-fetch' }

    t.test('asyncIterable', async t => {
      const response = new Response(gen())

      t.equal(await response.text(), 'undici-fetch')
      t.equal(response.headers.has('content-type'), false)

      t.end()
    })

    t.test('iterable', async t => {
      const response = new Response(['undici-fetch'])

      t.equal(await response.text(), 'undici-fetch')
      t.equal(response.headers.has('content-type'), false)

      t.end()
    })

    t.test('ArrayBuffer', async t => {
      const response = new Response(new ArrayBuffer(0))

      t.equal(await response.text(), '')
      t.equal(response.headers.has('content-type'), false)

      t.end()
    })

    t.test('ArrayBufferView', async t => {
      const response = new Response(new Uint8Array(0))

      t.equal(await response.text(), '')
      t.equal(response.headers.has('content-type'), false)

      t.end()
    })
  })

  t.doesNotThrow(() => new Response(null), 'supports null body')

  t.test('initializes default public properties', t => {
    t.plan(7)
    const response = new Response(null)

    t.equal(response.type, 'default')
    t.equal(response.url, '')
    t.equal(response.redirected, false)
    t.equal(response.status, 200)
    t.equal(response.ok, true)
    t.equal(response.statusText, '')
    t.ok(response.headers instanceof Headers)
  })

  t.test('url property returns last url in list', t => {
    t.plan(1)
    const url = new URL('http://undici.fetch/')
    const response = new Response(null)
    response[kUrlList].push(url)
    t.equal(response.url, url.toString())
  })
})

tap.test('Response.clone', t => {
  t.plan(3)

  t.test('returns cloned response instance', t => {
    t.plan(1)
    const response1 = new Response(null)
    const response2 = response1.clone()

    t.same(response1, response2)
  })

  t.test('throws error if disturbed is true', async t => {
    t.plan(1)
    const response = new Response('undici-fetch')
    await response.text()
    t.throws(() => response.clone(), 'Cannot clone Response - body is unusable')
  })

  t.test('throws for non-null body response', t => {
    t.plan(1)
    const response1 = new Response('undici-fetch')
    t.throws(() => response1.clone(), 'Cannot clone a non-null body response')
  })
})

tap.test('Response.error', t => {
  t.plan(5)

  const errorResponse = Response.error()

  t.equal(errorResponse.type, 'error')
  t.equal(errorResponse.body, null)
  t.equal(errorResponse.status, 0)
  t.equal(errorResponse.statusText, '')
  t.same(errorResponse.headers, new Headers())
})

tap.test('Response.redirect', t => {
  t.plan(9)

  const validURL = 'https://undici-fetch.dev'

  t.throws(() => Response.redirect(validURL, 200), 'throws on invalid status')
  t.doesNotThrow(() => Response.redirect(validURL, 301))
  t.doesNotThrow(() => Response.redirect(validURL, 302))
  t.doesNotThrow(() => Response.redirect(validURL, 303))
  t.doesNotThrow(() => Response.redirect(validURL, 307))
  t.doesNotThrow(() => Response.redirect(validURL, 308))

  const status = 301
  const response = Response.redirect(validURL, status)

  t.equal(response.body, null)
  t.equal(response.headers.get('location'), new URL(validURL).toString())
  t.equal(response.status, status)
})
