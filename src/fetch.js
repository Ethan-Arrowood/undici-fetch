'use strict'

const Undici = require('undici')
const Request = require('./request')
const Response = require('./response')
const { AbortError } = require('./utils')
const { STATUS_CODES } = require('http')
const { kHeaders } = require('./symbols')

// todo: how many redirects do we need to support?
const agent = new Undici.Agent({ maxRedirections: 0 })

async function fetch (resource, init = {}) {
	const request = new Request(resource, init)

	if (init.signal) {
		init.signal.once('abort', () => {
			throw new AbortError()
		})
	}

	try {
		const {statusCode, headers, body} = await agent.request({
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
		if (error instanceof Undici.errors.RequestAbortedError) {
			error = new AbortError()
		}
		throw error
	}
}

module.exports = { fetch }