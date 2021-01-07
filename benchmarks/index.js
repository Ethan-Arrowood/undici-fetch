const http = require('http')
const undiciFetch = require('../src/fetch')()
const nodeFetch = require('node-fetch')
const minipassFetch = require('minipass-fetch')
const microtime = require('microtime')

function printResults (results, n) {
  console.log(`Results for ${n} subsequent requests: `)
  const undiciFetchTT = results.undiciFetch.end - results.undiciFetch.start
  const nodeFetchTT = results.nodeFetch.end - results.nodeFetch.start
  const minipassFetchTT = results.minipassFetch.end - results.minipassFetch.start
  console.log(`undici-fetch | total time: ${undiciFetchTT}µs (${(undiciFetchTT * 0.001).toFixed(3)}ms)`)
  console.log(`node-fetch | total time: ${nodeFetchTT}µs (${(nodeFetchTT * 0.001).toFixed(3)}ms)`)
  console.log(`minipass-fetch | total time: ${minipassFetchTT}µs (${(minipassFetchTT * 0.001).toFixed(3)}ms)`)
  console.log(`---`)
  const pc1 = ((undiciFetchTT - nodeFetchTT) / nodeFetchTT) * 100
  console.log(`undici-fetch <> node-fetch percent change: ${pc1.toFixed(3)}%`)
  const pc2 = ((undiciFetchTT - minipassFetchTT) / minipassFetchTT) * 100
  console.log(`undici-fetch <> minipass-fetch percent change: ${pc2.toFixed(3)}%`)
}

function benchmarkParallel () {
  const N = 1000

  const server = http.createServer((req, res) => {
    setTimeout(() => {
      res.end('payload')
    }, 1)
  })

  const results = {
    undiciFetch: { start: null, end: null },
    nodeFetch: { start: null, end: null },
    minipassFetch: { start: null, end: null }
  }

  const generateRequests = (url, client) => Array.from(Array(N)).map(() => client(url).then(res => res.text()))

  const undiciFetchRequests = url => {
    results.undiciFetch.start = microtime.now()
    return Promise.all(generateRequests(url, undiciFetch)).then(() => {
      results.undiciFetch.end = microtime.now()
      undiciFetch.close()
    })
  }
  const nodeFetchRequests = url => {
    results.nodeFetch.start = microtime.now()
    return Promise.all(generateRequests(url, nodeFetch)).then(() => {
      results.nodeFetch.end = microtime.now()
    })
  }
  const minipassFetchRequests = url => {
    results.minipassFetch.start = microtime.now()
    return Promise.all(generateRequests(url, minipassFetch)).then(() => {
      results.minipassFetch.end = microtime.now()
    })
  }

  server.listen(0, () => {
    const url = `http://localhost:${server.address().port}`

    Promise.all([
      undiciFetchRequests(url),
      nodeFetchRequests(url),
      minipassFetchRequests(url)
    ]).then(() => {
      server.close()
      console.log(results)
      printResults(results, N)
    })
  })
}

function benchmarkSeries () {
  const N = 10000

  const server = http.createServer((req, res) => {
    setTimeout(() => {
      res.end('payload')
    }, 1)
  })

  const results = {
    undiciFetch: { start: null, end: null },
    nodeFetch: { start: null, end: null },
    minipassFetch: { start: null, end: null }
  }

  const undiciFetchRequests = async url => {
    results.undiciFetch.start = microtime.now()
    for (let i = 0; i < N; i++) {
      await undiciFetch(url).then(res => res.text())
    }
    results.undiciFetch.end = microtime.now()
    undiciFetch.close()
  }
  const nodeFetchRequests = async url => {
    results.nodeFetch.start = microtime.now()
    for (let i = 0; i < N; i++) {
      await nodeFetch(url).then(res => res.text())
    }
    results.nodeFetch.end = microtime.now()
  }
  const minipassFetchRequests = async url => {
    results.minipassFetch.start = microtime.now()
    for (let i = 0; i < N; i++) {
      await minipassFetch(url).then(res => res.text())
    }
    results.minipassFetch.end = microtime.now()
  }

  server.listen(0, () => {
    const url = `http://localhost:${server.address().port}`

    Promise.all([
      undiciFetchRequests(url),
      nodeFetchRequests(url),
      minipassFetchRequests(url)
    ]).then(() => {
      server.close()
      console.log(results)
      printResults(results, N)
    })
  })
}

benchmarkSeries()
