'use strict'

const undici = require('undici')

async function fetch (client, url, opts) {
	const response = await client.request({
		path: pathname,
		method: opts.method || 'GET'
	})

	response.bodyUsed = false

	async function arrayBuffer () {

	}

	async function buffer () {
		const body = await readBody(response.body)
		response.bodyUsed = true
		return body
	}

	async function blob () {

	}

	async function json () {
		const body = await readBody(response.body)
		response.bodyUsed = true
		return JSON.parse(body.toString('utf8'))
	}

	async function text () {
		const body = await readBody(response.body)
		response.bodyUsed = true
		return body.toString('utf8')
	}

	response.buffer = buffer
	response.arrayBuffer = arrayBuffer
	response.blob = blob
	response.json = json
	response.text = text

	return response
}

async function readBody (body) {
	const chunks = []
	for await (let chunk of body) {
		chunks.push(chunk)
	}
	return Buffer.concat(chunks)
}

function buildFetch (_url, opts = {}) {
	const url = new URL(_url)
	const client = new undici.Client(url.origin)

	return fetch(client, url, opts)
}

module.exports = buildFetch