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
  t.plan(4)

  const { Request, Response, Headers, Body } = require('../')

  t.same(Request, require('../src/request').Request)
  t.same(Response, require('../src/response').Response)
  t.same(Headers, require('../src/headers').Headers)
  t.same(Body, require('../src/body').Body)
})

tap.test('fetch exports internal symbols', t => {
  t.plan(1)

  const { internals: { symbols } } = require('../')

  t.same(symbols, require('../src/symbols'))
})
