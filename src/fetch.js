'use strict'

const Undici = require('undici')
const { STATUS_CODES } = require('http')
const Request = require('./request')
const Response = require('./response')
const { AbortError } = require('./utils')
const { kHeaders } = require('./symbols')

async function fetch (resource, init = {}) {
  const request = new Request(resource, init)

  try {
    const { statusCode, headers, body } = await Undici.request({
      origin: request.url.origin,
      path: request.url.pathname + request.url.search,
      method: request.method,
      headers: request.headers[kHeaders],
      body: request.body,
      signal: init.signal
    })

    return new Response(body, {
      status: statusCode,
      statusText: STATUS_CODES[statusCode],
      headers: headers
    })
  } catch (error) {
    if (error.code === new Undici.errors.RequestAbortedError().code) {
      throw new AbortError()
    }
    throw error
  }
}

module.exports = { fetch }
