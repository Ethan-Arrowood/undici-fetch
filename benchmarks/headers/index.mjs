import { benchmark, getPath } from '../benchmark.mjs'
import { suites } from './suites/index.mjs'

/** Sorted list of common header keys */
export const commonHeaderKeys = [
  'A-IM',
  'Accept',
  'Accept-Charset',
  'Accept-Datetime',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Patch',
  'Accept-Ranges',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Age',
  'Allow',
  'Alt-Svc',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Disposition',
  'Content-Encoding',
  'Content-Language',
  'Content-Length',
  'Content-Location',
  'Content-Range',
  'Content-Type',
  'Cookie',
  'Date',
  'Delta-Base',
  'ETag',
  'Expect',
  'Expires',
  'Forwarded',
  'From',
  'Host',
  'IM',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Last-Modified',
  'Link',
  'Location',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authenticate',
  'Proxy-Authorization',
  'Public-Key-Pins',
  'Range',
  'Referer',
  'Retry-After',
  'Server',
  'Set-Cookie',
  'Strict-Transport-Security',
  'TE',
  'Tk',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'User-Agent',
  'Vary',
  'Via',
  'WWW-Authenticate',
  'Warning'
]

export async function benchmarkHeaders () {
  const entities = [
    {
      id: 'undici-fetch',
      path: getPath('../index.js'),
      import: 'Headers'
    },
    {
      id: 'node-fetch',
      path: 'node-fetch',
      import: 'Headers'
    },
    {
      id: 'mapHeaders',
      path: getPath('headers/implementations/mapHeaders.js'),
      import: 'Headers'
    }
  ]

  /** Shuffle list for accurate sorting benchmarks */
  commonHeaderKeys.sort(() => Math.random() - 0.5)

  const runs = entities.map(module => suites.map(suite => suite(module, commonHeaderKeys))).flat()

  benchmark(runs, 'undici-fetch')
}
