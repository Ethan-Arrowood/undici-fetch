'use strict'

const tap = require('tap')
const { Readable } = require('stream')
const Body = require('../src/body')

tap.test('Body initialization', t => {
	t.plan(5)

	t.test('defaults to null', t => {
		t.plan(2)
		const body = new Body()
	
		t.strictEqual(body.body, null)
		t.strictEqual(body.bodyUsed, false)
	})

	t.test('allows null', t => {
		t.plan(2)
		const body = new Body(null)
	
		t.strictEqual(body.body, null)
		t.strictEqual(body.bodyUsed, false)
	})

	t.test('allows undefined', t => {
		t.plan(4)
		const body1 = new Body(undefined)
		t.strictEqual(body1.body, null)
		t.strictEqual(body1.bodyUsed, false)

		const body2 = new Body()
		t.strictEqual(body2.body, null)
		t.strictEqual(body2.bodyUsed, false)
	})

	t.test('allows stream.Readable', t => {
		t.plan(2)
		const readable = new Readable()
		const body = new Body(readable)
	
		t.ok(!!(body.body && typeof body.body.on === 'function'))
		t.strictEqual(body.bodyUsed, false)
	})

	t.test('throws for other inputs', t => {
		t.plan(6)
		const err = Error('body must be undefined, null, or a readable stream')
		t.throws(() => new Body('string'), err, 'throws on string')
		t.throws(() => new Body(100), err, 'throws on number')
		t.throws(() => new Body(true), err, 'throws on boolean')
		t.throws(() => new Body(() => {}), err, 'throws on function')
		t.throws(() => new Body([]), err, 'throws on array')
		t.throws(() => new Body({}), err, 'throws on object')
	})
})

tap.test('Body.arrayBuffer', t => {
	t.plan(2)

	t.test('returns an arrayBuffer when body is not null', async t => {
		t.plan(4)

		function * gen () {
			yield 'undici'
			yield '-'
			yield 'fetch'
		}
		const readable = Readable.from(gen(), { objectMode: false })
		const body = new Body(readable)
	
		t.ok(!body.bodyUsed)
		const res = await body.arrayBuffer()
		t.ok(body.bodyUsed)
		t.ok(res instanceof Buffer)
		t.strictEqual(res.toString(), 'undici-fetch')
	})

	t.test('returns null when body does not exist', async t => {
		t.plan(2)
	
		const body = new Body(null)
	
		t.ok(!body.bodyUsed)
		const res = await body.arrayBuffer()
		t.strictEqual(res, null)
	})
})

tap.test('Body.text', t => {
	t.plan(2)

	t.test('Body.text returns a string', async t => {
		t.plan(4)
	
		function * gen () {
			yield 'undici'
			yield '-'
			yield 'fetch'
		}
		const readable = Readable.from(gen(), { objectMode: false })
		const body = new Body(readable)
	
		t.ok(!body.bodyUsed)
		const res = await body.text()
		t.ok(body.bodyUsed)
		t.strictEqual(typeof res, 'string')
		t.strictEqual(res, 'undici-fetch')
	})

	t.test('returns null when body does not exist', async t => {
		t.plan(2)
	
		const body = new Body(null)
	
		t.ok(!body.bodyUsed)
		const res = await body.text()
		t.strictEqual(res, null)
	})
})

tap.test('Body.json returns a json object', async t => {
	t.plan(4)

	const json = { 'undici': 'fetch' }
	const readable = Readable.from(JSON.stringify(json))
	const body = new Body(readable)

	t.ok(!body.bodyUsed)
	const res = await body.json()
	t.ok(body.bodyUsed)
	t.strictEqual(typeof res, 'object')
	t.strictDeepEqual(res, json)
})

tap.test('Body.blob throws not supported error', async t => {
	t.plan(2)

	const readable = new Readable()
	const body = new Body(readable)
	t.ok(!body.bodyUsed)
	t.rejects(body.blob(), Error('Body.blob() is not supported yet by undici-fetch'))
})

tap.test('Body.formData throws not supported error', async t => {
	t.plan(2)

	const readable = new Readable()
	const body = new Body(readable)
	t.ok(!body.bodyUsed)
	t.rejects(body.formData(), Error('Body.formData() is not supported yet by undici-fetch'))
})