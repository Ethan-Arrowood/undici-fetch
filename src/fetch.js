'use strict'

const { types } = require('util')
const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')

const clientMap = new Map()

function buildFetch (resource, init = {}) {
  const request = new Request(resource, init)

  const origin = request.url.origin
  let client = clientMap.get(origin)
  if (client === undefined) {
    client = new Undici.Pool(origin)
    clientMap.set(origin, client)
  }

  function fetch () {
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
          headers: data.headers
        }))
      })
    })
  }

  return fetch()
}


module.exports = {
  default: buildFetch,
  fetch: buildFetch,
  clientMap
}
