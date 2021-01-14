'use strict'

const undici = require('undici')
const Request = require('./request')
const Response = require('./response')
const { STATUS_CODES } = require('http')

const kAgent = Symbol('agent')

function buildFetch (undiciPoolOpts) {
  if (arguments.length > 0) {
    throw Error('Did you forget to build the instance? Try: `const fetch = require(\'fetch\')()`')
  }

  const agent = new undici.Agent({ connections: null, ...undiciPoolOpts })

  async function fetch (resource, init = {}) {
    const request = new Request(resource, init)

    const { body, statusCode, headers } = await undici.request(request.url, {
      agent,
      method: request.method,
      body: request.body,
      headers: request.headers,
      signal: init.signal
    })

    return new Response(body, {
      status: statusCode,
      statusText: STATUS_CODES[statusCode],
      headers
    })
  }

  fetch[kAgent] = agent

  return fetch
}

module.exports = { buildFetch, kAgent }
