'use strict'

const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')
const { AbortError } = require('./utils')
const { createUndiciRequestOptions } = require('./utils')
const { STATUS_CODES } = require('http')

function buildFetch (undiciPoolOpts) {
  if (arguments.length > 0) {
    throw Error('Did you forget to build the instance? Try: `const fetch = require(\'undici-fetch\')()`')
  }

  const clientMap = new Map()

  function fetch (resource, init = {}) {
    const request = new Request(resource, init)

    const { origin } = request.url
    let client = clientMap.get(origin)
    if (client === undefined) {
      client = new Undici.Pool(origin, undiciPoolOpts)
      clientMap.set(origin, client)
    }

    const requestOptions = createUndiciRequestOptions(request, init.signal)

    return client.request(requestOptions)
      .then(data => new Response(data.body, {
        status: data.statusCode,
        statusText: STATUS_CODES[data.statusCode],
        headers: data.headers
      }))
      .catch(err => {
        if (err instanceof Undici.errors.RequestAbortedError) {
          err = new AbortError()
        }
        throw err
      })
  }

  fetch.close = () => Promise.all(
    Array.from(clientMap.values())
      .filter(client => !client.closed)
      .map(client => client.close())
  )

  return fetch
}

module.exports = buildFetch
