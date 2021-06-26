'use strict'

const tap = require('tap')
const http = require('http')
const { once } = require('events')
const { fetch } = require('../../src/fetch')

// https://github.com/Ethan-Arrowood/undici-fetch/issues/60

tap.test('if a server returns the same header name, it\'s parsed as an array', async t => {
  const values = ['a', 'b']

  const server = http.createServer((req, res) => {
    res.setHeader('key', values)
    res.end()
    res.socket.unref()
  })

  t.teardown(server.close.bind(server))

  server.listen()

  await once(server, 'listening')

  const response = await fetch(`http://localhost:${server.address().port}/`)
  t.equal(response.headers.get('key'), values.join(','))

  t.end()
})
