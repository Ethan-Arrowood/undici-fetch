'use strict'

const { createServer } = require('http')
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')

function printResults (results, n) {
  console.log(`Results for ${n} subsequent requests: `)
  const baselineTiming = Number.parseInt(results['undici-fetch'].endTime - results['undici-fetch'].startTime)
  Object.entries(results).forEach(([key, timing]) => {
    const elapsedTT = Number.parseFloat(timing.endTime - timing.startTime)
    console.log(`${key.padEnd(25)} | total time: ${elapsedTT}ns (${(elapsedTT * 0.000001).toFixed(3)}ms)`)
  })
  console.log('---')
  Object.entries(results).forEach(([key, timing]) => {
    if (key === 'undici-fetch') return
    const elapsedTT = Number.parseFloat(timing.endTime - timing.startTime)
    const percent = ((baselineTiming - elapsedTT) / elapsedTT) * 100
    console.log(`undici-fetch <> ${key} percent change: ${percent.toFixed(3)}%`)
  })
}

if (isMainThread) {
  const server = createServer((req, res) => {
    process.nextTick(() => {
      res.end('payload')
    })
  })

  server.listen(() => {
    const N = 1000
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
      spawnWorker(N, url, 'undici-fetch'),
      spawnWorker(N, url, 'node-fetch'),
      spawnWorker(N, url, 'node-fetch_with-agent'),
      spawnWorker(N, url, 'minipass-fetch'),
      spawnWorker(N, url, 'minipass-fetch_with-agent'),
      spawnWorker(N, url, 'axios'),
      spawnWorker(N, url, 'axios_with-agent')
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

  const http = require('http')
  const https = require('https')

  let fetchClient = null
  switch (clientType) {
    case 'undici-fetch': {
      fetchClient = require('../')
      break
    }
    case 'node-fetch': {
      fetchClient = require('node-fetch')
      break
    }
    case 'node-fetch_with-agent': {
      const fetch = require('node-fetch')
      const fetchHttpAgent = new http.Agent({ keepAlive: true })
      const fetchHttpsAgent = new https.Agent({ keepAlive: true })
      const fetchAgent = (_parsedURL) => _parsedURL.protocol === 'http:' ? fetchHttpAgent : fetchHttpsAgent
      fetchClient = (url) => {
        return fetch(url, {
          agent: fetchAgent
        })
      }
      break
    }
    case 'minipass-fetch': {
      fetchClient = require('minipass-fetch')
      break
    }
    case 'minipass-fetch_with-agent': {
      const minipassFetch = require('minipass-fetch')
      const mpHttpAgent = new http.Agent({ keepAlive: true })
      const mpHttpsAgent = new https.Agent({ keepAlive: true })
      const mpAgent = (_parsedURL) => _parsedURL.protocol === 'http:' ? mpHttpAgent : mpHttpsAgent
      fetchClient = (url) => {
        return minipassFetch(url, {
          agent: mpAgent
        })
      }
      break
    }
    case 'axios': {
      fetchClient = require('axios')
      break
    }
    case 'axios_with-agent': {
      const axios = require('axios')
      fetchClient = axios.create({
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true })
      })
      break
    }
    default: {
      throw Error(`Invalid fetch client ${clientType}`)
    }
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
      parentPort.postMessage({
        clientType,
        startTime,
        endTime
      })
      process.exit(1)
    })
}
