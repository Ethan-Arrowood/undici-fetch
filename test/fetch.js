const tap = require('tap')
const http = require('http')
const { once } = require('events')
const { Readable } = require('stream')

const { closeServer } = require('./testUtils')
const { fetch } = require('../src/fetch')

const validURL = 'https://undici-fetch.dev'

tap.test('fetch can handle basic requests', t => {

  t.test('simple GET request', {skip:true}, async t => {
    const wanted = 'undici-fetch'

    const server = http.createServer((req, res) => {
      t.equal(req.method, 'GET')
      res.write(wanted)
      res.end()
    })

    t.tearDown(server.close.bind(server))

    server.listen(0)

    await once(server, 'listening')

    const res = await fetch(`http://localhost:${server.address().port}/`)
    const found = await res.text()

    t.equal(found, wanted)

    t.end()
  })

  t.test('simple POST request', {skip:true}, async t => {
    const wanted = 'undici-fetch'

    const server = http.createServer((req, res) => {
      t.equal(req.method, 'POST')
      req.setEncoding('utf8')
      let found = ''
      req.on('data', d => {
        found += d
      })
      req.on('end', () => {
        res.write(found)
        res.end()
      })
    })

    t.tearDown(() => {
      server.close()
    })

    server.listen(0)

    await once(server, 'listening')

    const res = await fetch(
      `http://localhost:${server.address().port}/`,
      {
        method: 'POST',
        body: Readable.from(wanted, { objectMode: false })
      }
    )
    const found = await res.text()
    
    t.equal(found, wanted)
    t.end()
  })

  t.end()
})
