'use strict'

const tap = require('tap')
const http = require('http')
const fetch = require('../src/fetch')

tap.test('can make basic get request', async t => {
	t.plan(1)
	const wanted = 'undici-fetch'
	const server = http.createServer((req, res) => {
		res.write(wanted)
		res.end()
	})
	t.tearDown(() => {
		server.close.bind(server)()
		fetch.close()
	})
	server.listen(0)

	const res = await fetch(`http://localhost:${server.address().port}`)
	const found = await res.text()

	t.strictEquals(found, wanted)
})