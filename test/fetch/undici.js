'use strict'

const tap = require('tap')
const http = require('http')
const { once } = require('events')

const { fetch } = require('../../src/fetch')

tap.test('Bubble up undici errors', async t => {
  const server = http.createServer((req, res) => {
    req.socket.destroy()
  })

  t.teardown(server.close.bind(server))

  server.listen()

  await once(server, 'listening')

  try {
    await fetch(`http://localhost:${server.address().port}/`)
  } catch (error) {
    t.same(error.message, 'other side closed')
  }

  t.end()
})
