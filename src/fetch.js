'use strict'

const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')
const { STATUS_CODES } = require('http')

function buildFetch (undiciPoolOpts) {
  if (arguments.length > 0) {
    throw Error('Did you forget to build the instance? Try: `const fetch = require(\'fetch\')()`')
  }

  const clientMap = new Map()

  function fetch (resource, init = {}) {
    const request = new Request(resource, init)

    const origin = request.url.origin
    let client = clientMap.get(origin)
    if (client === undefined) {
      client = new Undici.Pool(origin, undiciPoolOpts)
      clientMap.set(origin, client)
    }

    return new Promise((resolve, reject) => {
      client.request({
        path: request.url.pathname,
        method: request.method,
        body: request.body,
        headers: request.headers,
        signal: init.signal
      }, (err, data) => {
        if (err) return reject(err)

        resolve(new Response(data.body, {
          status: data.statusCode,
          statusText: STATUS_CODES[data.statusCode],
          headers: data.headers
        }))
      })
    })
  }

  fetch.close = () => {
    const clientClosePromises = []
    for (const [, client] of clientMap) {
      if (!client.closed) {
        clientClosePromises.push(client.close())
      }
    }
    return Promise.all(clientClosePromises)
  }

  return fetch
}

module.exports = buildFetch
