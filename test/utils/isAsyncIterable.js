'use strict'

const tap = require('tap')

const { isAsyncIterable } = require('../../src/utils')

tap.test('isAsyncIterable', t => {
  t.plan(5)

  async function * f () {}
  class G {
    [Symbol.asyncIterator]() {}
  }
  t.ok(isAsyncIterable(f()))
  t.ok(isAsyncIterable(new G()))
  t.notOk(isAsyncIterable([]))
  t.notOk(isAsyncIterable(() => {}))
  t.notOk(isAsyncIterable('undici-fetch'))
})
