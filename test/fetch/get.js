const tap = require('tap')
const http = require('http')

const { fetch } = require('../../src/fetch')

tap.test('GET request', t => {
  t.plan(2)
  const wanted = 'undici-fetch'

  const server = http.createServer((req, res) => {
    t.equal(req.method, 'GET')
    res.write(wanted)
    res.end()
  })

  t.tearDown(server.close.bind(server))

  server.listen(0, () => {
    fetch(`http://localhost:${server.address().port}/`)
      .then(response => response.text())
      .then(found => {
        t.equal(found, wanted)
      })
  })
})
