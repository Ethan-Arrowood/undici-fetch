const { Worker, isMainThread, workerData } = require('worker_threads')

if (isMainThread) {
  const tap = require('tap')
  const { createServer } = require('http')
  tap.test('client unreferences self when idle', t => {
    t.plan(1)
    const server = createServer((req, res) => {
      res.write('undici-fetch')
      res.end()
    })
    t.teardown(server.close.bind(server))
    server.keepAliveTimeout = 3e3
    server.listen(0, () => {
      const url = `http://localhost:${server.address().port}`
      const worker = new Worker(__filename, { workerData: { url } })
      worker.on('exit', code => {
        t.equal(code, 0)
      })
    })
  })
} else {
  const { fetch } = require('../../src/fetch')

  fetch(workerData.url)
    .then(response => response.text())
    .then(found => {
      if (found !== 'undici-fetch') {
        throw new Error()
      }
    })

  setTimeout(() => {
    throw new Error()
  }, 1e3).unref()
}
