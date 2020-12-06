'use strict'

const { types } = require('util')
const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')

function buildFetch (basepath, pool = false, opts = {}) {
  if (typeof pool === 'object' && !types.isBoxedPrimitive(pool)) {
    opts = pool
    pool = false
  }
  const buildURL = path => new URL(path, basepath)
  const undici = pool ? new Undici.Pool(basepath, opts) : new Undici.Client(basepath, opts)

  function fetch (resource, init = {}) {
    if (typeof resource === 'string') {
      // Undici doesn't need a full Request instance
      resource = {
        url: { pathname: resource },
        method: init.method || 'GET',
        body: init.body,
        headers: init.headers,
        signal: init.signal
      }
    }

    return new Promise((resolve, reject) => {
      undici.request({
        path: resource.url.pathname,
        method: resource.method || 'GET',
        body: resource.body,
        headers: resource.headers,
        signal: resource.signal
      }, (err, data) => {
        if (err) return reject(err)

        resolve(new Response(data.body, {
          status: data.statusCode,
          headers: data.headers
        }))
      })
    })
  }

  fetch.close = () => {
    undici.close()
  }

  return fetch
}


module.exports = buildFetch
