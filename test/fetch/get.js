'use strict'

const tap = require('tap')
const http = require('http')
const { once } = require('events')

const { fetch } = require('../../src/fetch')

tap.test('GET request', async t => {
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

  const response = await fetch(`http://localhost:${server.address().port}/`)
  const found = await response.text()

  t.equal(found, wanted)

  t.end()
})

tap.test('multiple GET requets', async t => {
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

  const requests = []

  for (let i = 0; i < 5; i++) {
    requests.push(fetch(`http://localhost:${server.address().port}/`))
  }

  const responses = await Promise.all(requests)
  const results = await Promise.all(responses.map(response => response.text()))

  for (const result of results) {
    t.equal(result, wanted)
  }

  t.end()
})
