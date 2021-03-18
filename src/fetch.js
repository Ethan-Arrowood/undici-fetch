'use strict'

const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')
const { createUndiciRequestOptions } = require('./utils')
const { STATUS_CODES } = require('http')
const { promisify } = require('util')

const requestAsync = promisify(Undici.Pool.prototype.request)

function buildFetch (undiciPoolOpts) {
  if (arguments.length > 0) {
    throw Error('Did you forget to build the instance? Try: `const fetch = require(\'undici-fetch\')()`')
  }

  const clientMap = new Map()

  function fetch (resource, init = {}) {
    const request = new Request(resource, init)

    const { origin } = request.url
    let client
    if (clientMap.has(origin)) {
      client = clientMap.get(origin)
    } else {
      client = new Undici.Pool(origin, undiciPoolOpts)
      clientMap.set(origin, client)
    }

    const requestOptions = createUndiciRequestOptions(request, init.signal)

    return requestAsync.call(client, requestOptions)
      .then(data => new Response(data.body, {
        status: data.statusCode,
        statusText: STATUS_CODES[data.statusCode],
        headers: data.headers
      }))
  }

  fetch.close = () => Promise.all(
    Array.from(clientMap.values())
      .filter(client => !client.closed)
      .map(client => client.close())
  )

  return fetch
}

module.exports = buildFetch
