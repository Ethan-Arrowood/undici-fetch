'use strict'

const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')

function fetch (resource, init = {}) {
  return new Promise((resolve, reject) => {
    const request = new Request(resource, init)
    const client = new Undici.Client(request.url.origin)

    client.request({
      path: request.url.pathname,
      method: request.method,
      body: init.body,
      headers: init.headers,
      signal: init.signal
    }, (err, data) => {
      if (err) return reject(err)

      resolve(new Response(data.body, {
        status: data.statusCode,
        headers: data.headers
      }))
    })

    client.close()
  })
}

module.exports = fetch
