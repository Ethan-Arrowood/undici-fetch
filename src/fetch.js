'use strict'

const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')
const { AbortError, MockReadableStream } = require('./utils')
const { STATUS_CODES } = require('http')
const { kData } = require('./symbols')

function fetch (resource, init = {}) {
	return new Promise((resolve, reject) => {
		const request = new Request(resource, init)
		const pool = new Undici.Client(request.url.origin)

		if (init.signal) {
			init.signal.once('abort', () => {
				pool.close()
				reject(new AbortError())
			})
		}

		const mockRS = new MockReadableStream()

		const responseInit = {}

		pool.dispatch({
			path: request.url.pathname + request.url.search,
			method: request.method,
			headers: request.headers,
			body: request.body,
			signal: init.signal
		}, {
			onConnect: () => {},
			onError: error => {
				if (error instanceof Undici.errors.RequestAbortedError) {
					error = new AbortError()
				}
				reject(error)
			},
			onHeaders: (statusCode, headers) => {
				responseInit.status = statusCode
				responseInit.statusText = STATUS_CODES[statusCode]
				responseInit.headers = headers
			},
			onData: chunk => {
				mockRS[kData].push(chunk)
			},
			onComplete: () => {
				resolve(new Response(mockRS, responseInit))
			}
		})
	})
}

module.exports = { fetch }