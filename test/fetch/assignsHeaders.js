'use strict'

const tap = require('tap')
const http = require('http')
const { once } = require('events')

const { fetch } = require('../../src/fetch')

tap.test('Does not override accept and accept-language headers', async t => {
  t.plan(3)
  const server = http.createServer((req, res) => {
    t.equal(req.method, 'GET')
    t.equal(req.headers.accept, 'test')
    t.equal(req.headers['accept-language'], 'test')
    res.end()
    res.socket.unref()
  })

  t.teardown(server.close.bind(server))

  server.listen()

  await once(server, 'listening')

  await fetch(`http://localhost:${server.address().port}/`, {
    headers: [
      'accept', 'test',
      'accept-language', 'test'
    ]
  })
})
