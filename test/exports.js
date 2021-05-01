'use strict'

const tap = require('tap')

tap.test('fetch function is default export', t => {
  t.plan(1)

  const fetch = require('../')

  t.ok(typeof fetch === 'function')
})
