'use strict'

const tap = require('tap')
const http = require('http')
const buildFetch = require('../src/fetch')

tap.test('can make basic get request', async t => {
	t.plan(1)
	const wanted = 'undici-fetch'
	const server = http.createServer((req, res) => {
		res.write(wanted)
		res.end()
	})
	server.listen(3000)

	const fetch = buildFetch('http://localhost:3000')
	const res = await fetch('/')
	const found = await res.text()

	t.strictEquals(found, wanted)

	server.close()
	fetch.close()
})