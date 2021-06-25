'use strict'

const tap = require('tap')
const http = require('http')
const { once } = require('events')

const { fetch } = require('../../src/fetch')

tap.test('POST request', async t => {
  const body = JSON.stringify({ undici: 'fetch' })

  const server = http.createServer(async (req, res) => {
    t.equal(req.method, 'POST')

    let reqBody = ''
    for await (const chunk of req) {
      reqBody += chunk.toString()
    }

    t.equal(reqBody, body)

    res.end()
    res.socket.unref()
  })

  t.teardown(server.close.bind(server))

  server.listen()

  await once(server, 'listening')

  // we just need to check if the server receives the body we pass
  await fetch(`http://localhost:${server.address().port}/`, {
    method: 'POST',
    body: body
  })

  t.end()
})
