const tap = require('tap')
const semver = require('semver')
const http = require('http')
const { closeServer } = require('./testUtils')
const { fetch } = require('../src/fetch')
const { once } = require('events')

const validURL = 'https://undici-fetch.dev'

tap.test('fetch can handle basic requests', t => {
  t.test('simple GET request', async t => {
    const wanted = 'undici-fetch'

    const server = http.createServer((req, res) => {
      t.strictEqual(req.method, 'GET')
      res.write(wanted)
      res.end()
    })

    server.listen(0)

    await once(server, 'listening')

    const res = await fetch(`http://localhost:${server.address().port}/`)
    const found = await res.text()
    
    t.strictEqual(found, wanted)

    await fetch.close()
    await closeServer(server)
    t.end()
  })

  t.test('simple POST request', {skip: true}, t => {
    t.plan(2)

    const wanted = 'undici-fetch'

    const server = http.createServer((req, res) => {
      t.strictEqual(req.method, 'POST')
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

    t.tearDown(async () => {
      await fetch.close()
      await closeServer(server)
    })

    server.listen(0, async () => {
      const { port } = server.address()
      const res = await fetch(
        `http://localhost:${port}/`,
        {
          method: 'POST',
          body: Readable.from(wanted, { objectMode: false })
        }
      )
      const found = await res.text()
      t.strictEqual(found, wanted)
    })
  })

  t.end()
})