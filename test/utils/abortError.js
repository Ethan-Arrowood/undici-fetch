'use strict'

const tap = require('tap')

const { AbortError } = require('../../src/utils')

tap.test('AbortError', t => {
  t.plan(2)
  const error = new AbortError()

  t.equal(error.message, 'The operation was aborted')
  t.equal(error.name, 'AbortError')
})
