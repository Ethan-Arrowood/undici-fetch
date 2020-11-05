const undiciFetch = require('.')
const nodeFetch = require('node-fetch')
const assert = require('assert')

// ;(async () => {
// 	const undiciFetch = buildFetch('https://httpbin.org')
// 	const undiciRes = await undiciFetch('/get')
// 	const undiciJson = await undiciRes.json()

// 	const nodeRes = await nodeFetch('https://httpbin.org/get')
// 	const nodeJson = await nodeRes.json()

// 	console.log(undiciJson, nodeJson)
// 	// assert.deepStrictEqual(undiciJson, nodeJson)
// })()

;(async () => {
	const undiciRes = await undiciFetch('https://httpbin.org/get')
	const undiciText = await undiciRes.text()

	const nodeRes = await nodeFetch('https://httpbin.org/get')
	const nodeText = await nodeRes.text()

	console.log(undiciText, nodeText)
	// assert.deepStrictEqual(undiciJson, nodeJson)
})()