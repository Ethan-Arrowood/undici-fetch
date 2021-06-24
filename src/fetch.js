'use strict'

const Undici = require('undici')
const { STATUS_CODES } = require('http')
const { Request } = require('./request')
const { Response } = require('./response')
const { AbortError } = require('./utils')
const { headers: { kHeadersList } } = require('./symbols')

async function fetch (resource, init) {
  const request = new Request(resource, init)

  if (!request.headers.has('accept')) {
    request.headers.set('accept', '*/*')
  }

  if (!request.headers.has('accept-language')) {
    request.headers.set('accept-language', '*')
  }

  try {
    const { statusCode, headers, body } = await Undici.request(request.url, {
      method: request.method,
      headers: request.headers[kHeadersList],
      body: request.body?.data,
      signal: request.signal
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
