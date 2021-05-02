/* global AbortController */
'use strict'

const tap = require('tap')
const http = require('http')
const { once } = require('events')

const { fetch } = require('../../src/fetch')
const { AbortError } = require('../../src/utils')
const semver = require('semver')

tap.test('abort signal aborts request', { skip: semver.lte(process.version, 'v15.0.0') }, async t => {
  const wanted = 'undici-fetch'

  const server = http.createServer((req, res) => {
    t.equal(req.method, 'GET')
    res.write(wanted)
    res.end()
    res.socket.unref()
  })

  t.teardown(server.close.bind(server))

  server.listen()

  await once(server, 'listening')

  const abortController = new AbortController()

  try {
    abortController.abort()
    await fetch(`http://localhost:${server.address().port}/`, { signal: abortController.signal })
  } catch (error) {
    t.same(error, new AbortError())
  }

  t.end()
})
