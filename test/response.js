'use strict'

const tap = require('tap')
const { Readable } = require('stream')

const Response = require('../src/response')

tap.test('Response initialization', t => {
  t.plan(9)

  t.strictEqual(new Response(new Readable()).status, 200, 'status is defaulted to 200')
  t.strictEqual(new Response(new Readable()).statusText, '', 'statusText is defaulted to empty string')
  t.strictEqual(new Response(new Readable()).type, 'default', 'type is defaulted to 200')

  t.throw(() => new Response(new Readable(), { status: 100 }), 'throws on status less than 200')
  t.throw(() => new Response(new Readable(), { status: 600 }), 'throws on status greater than 599')
  t.throw(() => new Response(new Readable(), { status: '200' }), 'throws on status that is not type number')

  t.throw(() => new Response(new Readable(), { statusText: 0 }), 'throws on statusText that is not type string')

  t.ok(new Response(new Readable(), { status: 200 }).ok, '.ok is true when status is between 200 and 299 inclusive')
  t.notOk(new Response(new Readable(), { status: 300 }).ok, '.ok is false when status is outside 200 and 299 exclusive')
})

tap.test('Response.clone', t => {
  t.plan(2)

  t.test('returns new response instance when bodyUsed is false', t => {
    t.plan(2)
    const response1 = new Response(new Readable(), { headers: [['undici', 'fetch']] })
    const response2 = response1.clone()
    t.notEqual(response1.headers, response2.headers)
    t.strictDeepEqual(response1, response2)
  })

  t.test('throws error if bodyUsed is true', async t => {
    t.plan(1)
    const response = new Response(Readable.from('undici-fetch', { objectMode: false }))
    await response.text()
    t.throw(() => response.clone())
  })
})

tap.test('Response.error', t => {
  t.plan(2)

  const errorResponse = Response.error()

  t.strictEqual(errorResponse.type, 'error')
  t.strictEqual(errorResponse.body, null)
})

tap.test('Response.redirect', t => {
  t.plan(9)

  const validURL = 'https://undici-fetch.dev'

  t.throw(() => Response.redirect(validURL, 200), 'throws on invalid status')
  t.notThrow(() => Response.redirect(validURL, 301))
  t.notThrow(() => Response.redirect(validURL, 302))
  t.notThrow(() => Response.redirect(validURL, 303))
  t.notThrow(() => Response.redirect(validURL, 307))
  t.notThrow(() => Response.redirect(validURL, 308))

  const status = 301
  const response = Response.redirect(validURL, status)

  t.strictEqual(response.body, null)
  t.strictEqual(response.headers.get('location'), new URL(validURL).toString())
  t.strictEqual(response.status, status)
})
