'use strict'

const tap = require('tap')
const {
  Body,
  ControlledAsyncIterable,
  createAsyncIterableFromBlob,
  extractBody,
  consumeBody
} = require('../src/body')
const { isAsyncIterable } = require('../src/utils')
const { Blob } = require('buffer')

tap.test('Body initialization', t => {
  t.plan(3)

  t.test('defaults to null', t => {
    t.plan(2)
    const body = new Body()

    t.equal(body.body, null)
    t.equal(body.bodyUsed, false)
  })

  t.test('allows null and either iterables or async iterables', t => {
    t.plan(3)

    t.doesNotThrow(() => new Body({ [Symbol.iterator]: () => {} }))
    t.doesNotThrow(() => new Body({ [Symbol.asyncIterator]: () => {} }))
    t.doesNotThrow(() => new Body(null))
  })

  t.test('throws on non null and non iterables inputs', t => {
    t.plan(4)
    const err = Error('input argument must be `null` or implement either `[Symbol.asyncIterator]` or `[Symbol.iterator]`')
    t.throws(() => new Body(100), err, 'throws on number')
    t.throws(() => new Body(true), err, 'throws on boolean')
    t.throws(() => new Body(() => {}), err, 'throws on function')
    t.throws(() => new Body({}), err, 'throws on object')
  })
})

tap.test('Body.arrayBuffer', t => {
  t.plan(2)

  t.test('returns an arrayBuffer when body is not null', async t => {
    function * gen () {
      yield 'undici'
      yield '-'
      yield 'fetch'
    }

    const body = new Body(gen())

    t.equal(body.bodyUsed, false)

    const res = await body.arrayBuffer()

    t.equal(body.bodyUsed, true)
    t.ok(res instanceof Buffer)
    t.equal(res.toString('utf-8'), 'undici-fetch')

    t.end()
  })

  t.test('returns empty buffer when body does not exist', async t => {
    const body = new Body(null)

    t.equal(body.bodyUsed, false)

    const res = await body.arrayBuffer()

    t.equal(body.bodyUsed, false)
    t.equal(res.length, 0)

    t.end()
  })
})

tap.test('Body.text', t => {
  t.plan(2)

  t.test('returns a string', async t => {
    function * gen () {
      yield 'undici'
      yield '-'
      yield 'fetch'
    }

    const body = new Body(gen())

    t.equal(body.bodyUsed, false)

    const res = await body.text()

    t.equal(body.bodyUsed, true)
    t.equal(typeof res, 'string')
    t.equal(res, 'undici-fetch')

    t.end()
  })

  t.test('returns empty string when body does not exist', async t => {
    const body = new Body(null)

    t.equal(body.bodyUsed, false)

    const res = await body.text()

    t.equal(body.bodyUsed, false)
    t.equal(res, '')
    t.end()
  })
})

tap.test('Body.json returns a json object', async t => {
  const json = { undici: 'fetch' }
  const body = new Body(JSON.stringify(json))

  t.equal(body.bodyUsed, false)

  const res = await body.json()

  t.equal(body.bodyUsed, true)
  t.equal(typeof res, 'object')
  t.strictSame(res, json)

  t.end()
})

tap.test('Body.blob returns a blob instance', async t => {
  const body = new Body('undici-fetch')

  t.equal(body.bodyUsed, false)

  const blob = await body.blob()

  t.equal(body.bodyUsed, true)
  t.ok(blob instanceof Blob)
  t.equal(await blob.text(), 'undici-fetch')

  t.end()
})

tap.test('Body.formData throws not supported error', async t => {
  t.plan(2)

  const body = new Body()
  t.equal(body.bodyUsed, false)
  t.rejects(body.formData(), Error('Body.formData() is not supported yet by undici-fetch'))
})

tap.test('Body utility classes and methods', t => {
  t.plan(4)

  t.test('ContolledAsyncIterable', t => {
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

  t.test('consumeBody throws if body is disturbed', async t => {
    function * gen () { yield 'undici-fetch' }

    const controlled = new ControlledAsyncIterable(gen())

    for await (const _ of controlled); // eslint-disable-line no-unused-vars

    t.rejects(() => consumeBody(controlled))
    t.end()
  })

  t.test('createAsyncIterableFromBlob', async t => {
    const blob = new Blob(['undici-fetch'])

    const asyncIterable = createAsyncIterableFromBlob(blob)

    t.equal(isAsyncIterable(asyncIterable), true)

    let res = ''
    for await (const text of asyncIterable) {
      res += text
    }
    t.equal(res, 'undici-fetch')
    t.end()
  })

  t.test('extractBody', t => {
    t.plan(9)

    t.strictSame(
      extractBody(new URLSearchParams('undici=fetch&fetch=undici')),
      [
        'undici=fetch&fetch=undici',
        'application/x-www-form-urlencoded;charset=UTF-8'
      ],
      'extracts from URLSearchParams'
    )

    t.strictSame(
      extractBody('undici-fetch'),
      ['undici-fetch', 'text/plain;charset=UTF-8'],
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
      extractBody(new Blob(['undici-fetch'], { type: 'abc' })),
      [{ [Symbol.asyncIterator] () {} }, 'abc'],
      'extracts from Blob'
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
})
