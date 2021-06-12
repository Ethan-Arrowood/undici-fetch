'use strict'

const tap = require('tap')
const {
  ControlledAsyncIterable,
  extractBody,
  consumeBody,
  BodyMixin
} = require('../src/body')
const {
  body: {
    kBody
  }
} = require('../src/symbols')

tap.test('BodyMixin', t => {
  t.plan(6)

  class Body {}

  BodyMixin(Body.prototype)

  t.test('defines expected properties', t => {
    t.plan(7)

    const body = new Body()

    body[kBody] = null

    t.equal(body.body, null)
    t.equal(body.bodyUsed, false)
    t.equal(typeof body.arrayBuffer, 'function')
    t.equal(typeof body.blob, 'function')
    t.equal(typeof body.formData, 'function')
    t.equal(typeof body.json, 'function')
    t.equal(typeof body.text, 'function')
  })

  t.test('arrayBuffer()', t => {
    t.plan(2)

    t.test('returns Buffer when not null', async t => {
      function * gen () {
        yield 'undici'
        yield '-'
        yield 'fetch'
      }
      const body = new Body()
      body[kBody] = new ControlledAsyncIterable(gen())
      t.equal(body.bodyUsed, false)

      const res = await body.arrayBuffer()

      t.equal(body.bodyUsed, true)
      t.ok(res instanceof Buffer)
      t.equal(res.toString('utf-8'), 'undici-fetch')

      t.end()
    })

    t.test('returns empty buffer when body does not exist', async t => {
      const body = new Body()
      body[kBody] = null

      t.equal(body.bodyUsed, false)

      const res = await body.arrayBuffer()

      t.equal(body.bodyUsed, false)
      t.equal(res.length, 0)

      t.end()
    })
  })

  t.test('text()', t => {
    t.plan(2)

    t.test('returns a string', async t => {
      function * gen () {
        yield 'undici'
        yield '-'
        yield 'fetch'
      }

      const body = new Body()
      body[kBody] = new ControlledAsyncIterable(gen())

      t.equal(body.bodyUsed, false)

      const res = await body.text()

      t.equal(body.bodyUsed, true)
      t.equal(typeof res, 'string')
      t.equal(res, 'undici-fetch')

      t.end()
    })

    t.test('returns empty string when body does not exist', async t => {
      const body = new Body()
      body[kBody] = null

      t.equal(body.bodyUsed, false)

      const res = await body.text()

      t.equal(body.bodyUsed, false)
      t.equal(res, '')
      t.end()
    })
  })

  t.test('Body.json returns a json object', async t => {
    const json = { undici: 'fetch' }
    const body = new Body()
    body[kBody] = new ControlledAsyncIterable(JSON.stringify(json))

    t.equal(body.bodyUsed, false)

    const res = await body.json()

    t.equal(body.bodyUsed, true)
    t.equal(typeof res, 'object')
    t.strictSame(res, json)

    t.end()
  })

  t.test('Body.blob throws not supported error', async t => {
    t.plan(2)

    const body = new Body()
    body[kBody] = null

    t.equal(body.bodyUsed, false)
    t.rejects(body.blob(), Error('Body.blob() is not supported yet by undici-fetch'))
  })

  t.test('Body.formData throws not supported error', async t => {
    t.plan(2)

    const body = new Body()
    body[kBody] = null

    t.equal(body.bodyUsed, false)
    t.rejects(body.formData(), Error('Body.formData() is not supported yet by undici-fetch'))
  })
})

tap.test('ContolledAsyncIterable', t => {
  t.plan(4)

  t.test('Works with iterables', async t => {
    const iterable = ['a', 'b', 'c']

    const controlled = new ControlledAsyncIterable(iterable)

    t.equal(controlled.disturbed, false)

    let i = 0
    for await (const item of controlled) {
      t.equal(controlled.disturbed, true)
      t.equal(item, iterable[i++])
    }

    t.end()
  })

  t.test('Works with async iterables', async t => {
    function * gen () {
      yield 'undici'
      yield '-'
      yield 'fetch'
    }

    const controlled = new ControlledAsyncIterable(gen())

    t.equal(controlled.disturbed, false)

    let str = ''
    for await (const item of controlled) {
      t.equal(controlled.disturbed, true)
      str += item
    }

    t.equal(str, 'undici-fetch')

    t.end()
  })

  t.test('Throws error if instantiated without iterable', t => {
    t.plan(4)
    t.throws(() => new ControlledAsyncIterable({}))
    t.throws(() => new ControlledAsyncIterable(() => {}))
    t.throws(() => new ControlledAsyncIterable(0))
    t.throws(() => new ControlledAsyncIterable(false))
  })

  t.test('Throws error if iterated when disturbed', async t => {
    function * gen () { yield 'undici-fetch' }

    const controlled = new ControlledAsyncIterable(gen())

    t.equal(controlled.disturbed, false)

    let str = ''
    for await (const item of controlled) {
      str += item
    }

    t.equal(str, 'undici-fetch')
    t.equal(controlled.disturbed, true)

    t.rejects(async () => {
      for await (const _ of controlled); // eslint-disable-line no-unused-vars
    }, 'cannot iterate on distured iterable')

    t.end()
  })
})

tap.test('consumeBody throws if body is disturbed', async t => {
  function * gen () { yield 'undici-fetch' }

  const controlled = new ControlledAsyncIterable(gen())

  for await (const _ of controlled); // eslint-disable-line no-unused-vars

  t.rejects(() => consumeBody(controlled))
  t.end()
})

tap.test('extractBody', t => {
  t.plan(8)

  t.strictSame(
    extractBody(new URLSearchParams('undici=fetch&fetch=undici')),
    [
      Buffer.from('undici=fetch&fetch=undici'),
      'application/x-www-form-urlencoded;charset=UTF-8'
    ],
    'extracts from URLSearchParams'
  )

  t.strictSame(
    extractBody('undici-fetch'),
    [Buffer.from('undici-fetch'), 'text/plain;charset=UTF-8'],
    'extracts from string'
  )

  function * gen () { yield 'undici-fetch' }

  t.strictSame(
    extractBody(gen()),
    [gen(), null],
    'extracts from async iterable'
  )

  t.throws(
    () => extractBody(gen(), true),
    'Cannot extract body while keepalive is true'
  )

  t.strictSame(
    extractBody(['undici-fetch']),
    [['undici-fetch'], null],
    'extracts from iterable'
  )

  t.strictSame(
    extractBody(new ArrayBuffer(0)),
    [Buffer.alloc(0), null],
    'extracts from ArrayBuffer'
  )

  t.strictSame(
    extractBody(new Uint8Array(0)),
    [Buffer.alloc(0), null],
    'extracts from ArrayBufferView'
  )

  t.throws(
    () => extractBody({}),
    'Cannot extract Body from input: [object: Object]'
  )
})
