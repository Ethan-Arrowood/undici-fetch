'use strict'

const tap = require('tap')
const { Readable } = require('stream')
const Body = require('../src/body')
const { isAsyncIterable } = require('../src/utils')

tap.test('Body initialization', t => {
  t.plan(4)

  t.test('defaults to null', t => {
    t.plan(2)
    const body = new Body()

    t.equal(body.body, null)
    t.equal(body.bodyUsed, false)
  })

  t.test('allows null, undefined, and stream.Readable', t => {
    t.plan(3)

    t.doesNotThrow(() => new Body(new Readable()))
    t.doesNotThrow(() => new Body(null))
    t.doesNotThrow(() => new Body(undefined))
  })

  t.test('assigns Readable input to body property', t => {
    t.plan(2)
    const body = new Body(new Readable())

    t.ok(isAsyncIterable(body.body))
    t.equal(body.bodyUsed, false)
  })

  t.test('throws for other inputs', t => {
    t.plan(4)
    const err = Error('body must be `undefined`, `null`, or implement `[Symbol.asyncIterator]`')
    t.throws(() => new Body(100), err, 'throws on number')
    t.throws(() => new Body(true), err, 'throws on boolean')
    t.throws(() => new Body(() => {}), err, 'throws on function')
    t.throws(() => new Body({}), err, 'throws on object')
  })
})

tap.test('Body.arrayBuffer', t => {
  t.plan(2)

  t.test('returns an arrayBuffer when body is not null', async t => {
    t.plan(4)

    function * gen () {
      yield 'undici'
      yield '-'
      yield 'fetch'
    }
    const readable = Readable.from(gen(), { objectMode: false })
    const body = new Body(readable)

    t.ok(!body.bodyUsed)
    const res = await body.arrayBuffer()
    t.ok(body.bodyUsed)
    t.ok(res instanceof Buffer)
    t.equal(res.toString(), 'undici-fetch')
  })

  t.test('returns empty buffer when body does not exist', async t => {
    t.plan(2)

    const body = new Body(null)

    t.ok(!body.bodyUsed)
    const res = await body.arrayBuffer()
    t.equal(res.length, 0)
  })
})

tap.test('Body.text', t => {
  t.plan(2)

  t.test('Body.text returns a string', async t => {
    t.plan(4)

    function * gen () {
      yield 'undici'
      yield '-'
      yield 'fetch'
    }
    const readable = Readable.from(gen(), { objectMode: false })
    const body = new Body(readable)

    t.ok(!body.bodyUsed)
    const res = await body.text()
    t.ok(body.bodyUsed)
    t.equal(typeof res, 'string')
    t.equal(res, 'undici-fetch')
  })

  t.test('returns empty string when body does not exist', async t => {
    t.plan(2)

    const body = new Body(null)

    t.ok(!body.bodyUsed)
    const res = await body.text()
    t.equal(res, '')
  })
})

tap.test('Body.json returns a json object', async t => {
  t.plan(4)

  const json = { undici: 'fetch' }
  const readable = Readable.from(JSON.stringify(json))
  const body = new Body(readable)

  t.ok(!body.bodyUsed)
  const res = await body.json()
  t.ok(body.bodyUsed)
  t.equal(typeof res, 'object')
  t.strictSame(res, json)
})

tap.test('Body.blob throws not supported error', async t => {
  t.plan(2)

  const readable = new Readable()
  const body = new Body(readable)
  t.ok(!body.bodyUsed)
  t.rejects(body.blob(), Error('Body.blob() is not supported yet by undici-fetch'))
})

tap.test('Body.formData throws not supported error', async t => {
  t.plan(2)

  const readable = new Readable()
  const body = new Body(readable)
  t.ok(!body.bodyUsed)
  t.rejects(body.formData(), Error('Body.formData() is not supported yet by undici-fetch'))
})
