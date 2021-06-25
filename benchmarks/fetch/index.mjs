import { benchmark, spawnRunWorker, getPath } from '../benchmark.mjs'
import { createServer } from 'http'
import { once } from 'events'

export async function benchmarkFetch () {
  const entities = [
    {
      id: 'undici-fetch',
      path: getPath('../index.js'),
      import: 'default'
    },
    {
      id: 'node-fetch',
      path: 'node-fetch',
      import: 'default'
    },
    {
      id: 'node-fetch_with-agent',
      path: 'node-fetch',
      import: 'default'
    },
    {
      id: 'minipass-fetch',
      path: 'minipass-fetch',
      import: 'default'
    },
    {
      id: 'minipass-fetch_with-agent',
      path: 'minipass-fetch',
      import: 'default'
    },
    {
      id: 'axios',
      path: 'axios',
      import: 'default'
    },
    {
      id: 'axios_with-agent',
      path: 'axios',
      import: 'default'
    }
  ]

  const before = fetch => _ => async id => {
    const _http = await import('http')
    const _https = await import('https')

    switch (id) {
      case 'node-fetch_with-agent':
      case 'minipass-fetch_with-agent': {
        const fetchHttpAgent = new _http.Agent({ keepAlive: true })
        const fetchHttpsAgent = new _https.Agent({ keepAlive: true })
        const fetchAgent = (parsedURL) => parsedURL.protocol === 'http:' ? fetchHttpAgent : fetchHttpsAgent
        const fetchClient = (url) => fetch(url, { agent: fetchAgent })
        return [fetchClient]
      }
      case 'axios_with-agent': {
        // fetch is axios here
        const fetchClient = fetch.create({
          httpAgent: new _http.Agent({ keepAlive: true }),
          httpsAgent: new _https.Agent({ keepAlive: true })
        })
        return [fetchClient]
      }
      case 'undici-fetch':
      case 'node-fetch':
      case 'minipass-fetch':
      case 'axios':
        return [fetch]
      default:
        throw new Error(`Invalid fetch client ${id}`)
    }
  }

  const main = _ => fetch => async (N, url) => {
    for (let i = 0; i < N; i++) {
      await fetch(url)
    }
    return [fetch]
  }

  const server = createServer((req, res) => {
    process.nextTick(() => {
      res.end('payload')
    })
  })

  server.listen(0)
  await once(server, 'listening')

  const N = 1000
  const url = `http://localhost:${server.address().port}`

  const runs = entities.map(entity => {
    return spawnRunWorker({
      entity,
      suite: { id: 'fetch' },
      before: {
        func: before.toString(),
        args: [entity.id]
      },
      main: {
        func: main.toString(),
        args: [N, url]
      }
    })
  })

  await benchmark(runs, 'undici-fetch')

  server.close()
}
