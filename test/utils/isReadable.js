'use strict'

const tap = require('tap')
const { Readable, Duplex, Writable, Stream } = require('stream')

const { isReadable } = require('../../src/utils')

tap.test('isReadable', t => {
  t.plan(4)

  t.ok(isReadable(new Readable()))
  t.ok(isReadable(new Duplex()))
  t.notOk(isReadable(new Writable()))
  t.notOk(isReadable(new Stream()))
})
