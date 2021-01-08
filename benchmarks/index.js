'use strict'

const { createServer } = require('http')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

function printResults (results, n) {
  console.log(`Results for ${n} subsequent requests: `)
  const undiciFetchTT = Number.parseInt(results.undici.endTime - results.undici.startTime)
  const nodeFetchTT = Number.parseInt(results.node.endTime - results.node.startTime)
  const minipassFetchTT = Number.parseInt(results.minipass.endTime - results.minipass.startTime)
  console.log(`undici-fetch | total time: ${undiciFetchTT}ns (${(undiciFetchTT * 0.000001).toFixed(3)}ms)`)
  console.log(`node-fetch | total time: ${nodeFetchTT}ns (${(nodeFetchTT * 0.000001).toFixed(3)}ms)`)
  console.log(`minipass-fetch | total time: ${minipassFetchTT}ns (${(minipassFetchTT * 0.000001).toFixed(3)}ms)`)
  console.log('---')
  const pc1 = ((undiciFetchTT - nodeFetchTT) / nodeFetchTT) * 100
  console.log(`undici-fetch <> node-fetch percent change: ${pc1.toFixed(3)}%`)
  const pc2 = ((undiciFetchTT - minipassFetchTT) / minipassFetchTT) * 100
  console.log(`undici-fetch <> minipass-fetch percent change: ${pc2.toFixed(3)}%`)
}

if (isMainThread) {
  const server = createServer((req, res) => {
    setTimeout(() => {
      res.end('payload')
    }, 1)
  })

  server.listen(0, () => {
    const N = 10000
    const url = `http://localhost:${server.address().port}`

    const spawnWorker = (N, url, clientType) => new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { N, url, clientType }
      })
      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    })

    Promise.all([
      spawnWorker(N, url, 'undici'),
      spawnWorker(N, url, 'node'),
      spawnWorker(N, url, 'minipass')
    ]).then(values => {
      const results = {}
      for (const { clientType, startTime, endTime } of values) {
        results[clientType] = { startTime, endTime }
      }
      console.log(results)
      printResults(results, N)

      server.close()
    })
  })
} else {
  const { N, url, clientType } = workerData

  let fetchClient = null
  let close = false
  switch (clientType) {
    case 'undici':
      fetchClient = require('../src/fetch')()
      close = true
      break
    case 'node':
      fetchClient = require('node-fetch')
      break
    case 'minipass':
      fetchClient = require('minipass-fetch')
      break
    default:
      throw Error(`Invalid fetch client ${clientType}`)
  }

  const run = async (N, url, fetchClient) => {
    const startTime = process.hrtime.bigint()

    for (let i = 0; i < N; i++) {
      await fetchClient(url)
    }

    const endTime = process.hrtime.bigint()

    return { startTime, endTime }
  }

  run(N, url, fetchClient)
    .then(({ startTime, endTime }) => {
      if (close) {
        fetchClient.close()
      }

      parentPort.postMessage({
        clientType,
        startTime,
        endTime
      })
    })
}
