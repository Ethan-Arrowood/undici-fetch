'use strict'

const tap = require('tap')
const semver = require('semver')
const http = require('http')
const { Readable } = require('stream')
const { AbortError } = require('../src/utils')
const { closeServer } = require('./testUtils')

const validURL = 'https://undici-fetch.dev'

tap.test('throws error if user does not build instance before calling fetch', t => {
  t.plan(1)
  const { buildFetch } = require('../')

  t.throw(() => buildFetch(validURL))
})

const { buildFetch } = require('../')

tap.test('fetch instance is a function', t => {
  t.plan(1)
  const fetch = buildFetch()
  t.ok(typeof fetch === 'function')
})

tap.test('fetch can handle basic requests', t => {
  t.plan(2)

  const fetch = buildFetch()

  t.test('simple GET request', t => {
    t.plan(2)

    const wanted = 'undici-fetch'

    const server = http.createServer((req, res) => {
      t.strictEqual(req.method, 'GET')
      res.write(wanted)
      res.end()
    })

    t.tearDown(async () => {
      await fetch.close()
      await closeServer(server)
    })

    server.listen(0, async () => {
      const { port } = server.address()
      const res = await fetch(`http://localhost:${port}/`)
      const found = await res.text()

      t.strictEqual(found, wanted)
    })
  })

  t.test('simple POST request', t => {
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
})

tap.test('fetch forwards abort signal', { skip: semver.lt(process.versions.node, '15.0.0') }, t => {
  t.plan(1)

  const fetch = buildFetch()

  const server = http.createServer((req, res) => {
    t.fail()
    res.end()
  })

  t.tearDown(async () => {
    await fetch.close()
    await closeServer(server)
  })

  const abortController = new AbortController() // eslint-disable-line no-undef

  server.listen(0, async () => {
    abortController.abort()

    try {
      await fetch(`http://localhost:${server.address().port}`, { signal: abortController.signal })
    } catch (err) {
      t.ok(err instanceof AbortError)
    }
  })
})

tap.test('fetch supports multiple URL origins', t => {
  t.plan(6)

  const fetch = buildFetch()

  const wanted = 'undici-fetch'

  const createServer = () => http.createServer((req, res) => {
    t.strictEqual(req.method, 'GET')
    res.write(wanted)
    res.end()
  })

  const servers = [
    createServer(),
    createServer(),
    createServer()
  ]

  t.tearDown(async () => {
    await Promise.all([
      fetch.close(),
      ...servers.map(server => closeServer(server))
    ])
  })

  for (const server of servers) {
    server.listen(0, async () => {
      const res = await fetch(`http://localhost:${server.address().port}`)
      const found = await res.text()

      t.strictEquals(found, wanted)
    })
  }
})

tap.test('fetch supports multiple requests to same origin', t => {
  t.plan(4)

  const fetch = buildFetch()

  const wanted = 'undici-fetch'

  const server = http.createServer((req, res) => {
    t.strictEqual(req.method, 'GET')
    res.write(wanted)
    res.end()
  })

  t.tearDown(async () => {
    await fetch.close()
    await closeServer(server)
  })

  server.listen(0, async () => {
    const res1 = await fetch(`http://localhost:${server.address().port}`)
    const res2 = await fetch(`http://localhost:${server.address().port}`)

    const found1 = await res1.text()
    const found2 = await res2.text()

    t.strictEquals(found1, wanted)
    t.strictEquals(found2, wanted)
  })
})

tap.test('fetch supports many requests to many servers', t => {
  /*
   * 3 servers
   * 2 requests per server
   * 2 tests per request
   * 3*2*2=12
   */
  t.plan(12)

  const fetch = buildFetch()

  const wanted = 'undici-fetch'

  const createServer = () => http.createServer((req, res) => {
    t.strictEqual(req.method, 'GET')
    res.write(wanted)
    res.end()
  })

  const servers = [
    createServer(),
    createServer(),
    createServer()
  ]

  t.tearDown(async () => {
    await Promise.all([
      fetch.close(),
      ...servers.map(server => closeServer(server))
    ])
  })

  for (const server of servers) {
    server.listen(0, async () => {
      const res1 = await fetch(`http://localhost:${server.address().port}`)
      const res2 = await fetch(`http://localhost:${server.address().port}`)

      const found1 = await res1.text()
      const found2 = await res2.text()

      t.strictEquals(found1, wanted)
      t.strictEquals(found2, wanted)
    })
  }
})
