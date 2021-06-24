'use strict'

const tap = require('tap')

tap.test('fetch function is default export', t => {
  t.plan(1)

  const fetch = require('../')

  t.ok(typeof fetch === 'function')
})

tap.test('fetch forwards undici globalDispatcher methods', t => {
  t.plan(2)

  const { setGlobalDispatcher: _setGlobalDispatcher, getGlobalDispatcher: _getGlobalDispatcher } = require('../')
  const { setGlobalDispatcher, getGlobalDispatcher } = require('undici')
  t.same(_setGlobalDispatcher, setGlobalDispatcher)
  t.same(_getGlobalDispatcher, getGlobalDispatcher)
})

tap.test('fetch exports core classes', t => {
  t.plan(3)

  const { Request, Response, Headers } = require('../')

  t.same(Request, require('../src/request').Request)
  t.same(Response, require('../src/response').Response)
  t.same(Headers, require('../src/headers').Headers)
})
