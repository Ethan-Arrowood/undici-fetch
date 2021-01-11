# undici-fetch

```sh
npm i undici-fetch
```

Built on [Undici](https://github.com/nodejs/undici)

## Table of Contents

- [undici-fetch](#undici-fetch)
	- [Table of Contents](#table-of-contents)
- [Benchmarks](#benchmarks)
- [API](#api)
	- [Default Method: `fetch(resource, [init])`](#default-method-fetchresource-init)
	- [Method: `buildFetch()`](#method-buildfetch)
	- [Class: Headers](#class-headers)
		- [`new Headers([init])`](#new-headersinit)
		- [Instance Methods](#instance-methods)
			- [`Headers.append(name, value)`](#headersappendname-value)
			- [`Headers.delete(name)`](#headersdeletename)
			- [`Headers.get(name)`](#headersgetname)
			- [`Headers.has(name)`](#headershasname)
			- [`Headers.set(name, value)`](#headerssetname-value)
			- [`Headers.values()`](#headersvalues)
			- [`Headers.entries()`](#headersentries)
			- [`Headers.keys()`](#headerskeys)
			- [`Headers[Symbol.iterator]`](#headerssymboliterator)
	- [Class: Body](#class-body)
		- [`new Body([input])`](#new-bodyinput)
		- [Instance Properties](#instance-properties)
			- [`Body.body`](#bodybody)
			- [`Body.bodyUsed`](#bodybodyused)
		- [Instance Methods](#instance-methods-1)
			- [`Body.arrayBuffer()`](#bodyarraybuffer)
			- [`Body.blob()`](#bodyblob)
			- [`Body.formData()`](#bodyformdata)
			- [`Body.json()`](#bodyjson)
			- [`Body.text()`](#bodytext)
	- [Class: Request](#class-request)
		- [`new Request(input, [init])`](#new-requestinput-init)
		- [Instance Properties:](#instance-properties-1)
			- [`Request.url`](#requesturl)
			- [`Request.method`](#requestmethod)
			- [`Request.headers`](#requestheaders)
		- [Instance Methods:](#instance-methods-2)
			- [`Request.clone()`](#requestclone)
	- [Class: Response](#class-response)
		- [`new Response(body, [init])`](#new-responsebody-init)
		- [Instance Properties](#instance-properties-2)
			- [`Response.headers`](#responseheaders)
			- [`Response.ok`](#responseok)
			- [`Response.status`](#responsestatus)
			- [`Response.statusText`](#responsestatustext)
			- [`Response.type`](#responsetype)
		- [Instance Methods](#instance-methods-3)
			- [`Response.clone()`](#responseclone)
		- [Static Methods](#static-methods)
			- [`Response.error()`](#responseerror)
			- [`Response.redirect(url, status)`](#responseredirecturl-status)
- [TypeScript](#typescript)
- [Spec Omissions](#spec-omissions)

# Benchmarks

`npm run benchmarks`

On my personal machine:

```
MacBook Pro (15-inch, 2018)
Processor 2.9 GHz 6-Core Intel Core i9
Memory 32 GB 2400 MHz DDR4
```

Results:

```
{
  undici: { startTime: 72530288319510n, endTime: 72544207363031n },
  node: { startTime: 72530283341532n, endTime: 72575809241450n },
  minipass: { startTime: 72530290384674n, endTime: 72576867597178n }
}
Results for 10000 subsequent requests: 
undici-fetch | total time: 13919043521ns (13919.044ms)
node-fetch | total time: 45525899918ns (45525.900ms)
minipass-fetch | total time: 46577212504ns (46577.213ms)
---
undici-fetch <> node-fetch percent change: -69.426%
undici-fetch <> minipass-fetch percent change: -70.116%
```

# API

The default export for this module is a fetch client instance [`fetch`](). It uses the default `Undici.Pool()` options.

In order to pass options to the underlying Pool instance, use the named export [`buildFetch`]() method. The fetch instance returned by this method should be used throughout a project. Behind the scenes, `undici-fetch` reuses the pool instances for similar url origins. The pools are memoized in a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) that is initialized in the `buildFetch` closure.

**Notice:** You must call `fetch.close()` at the end of your project in order to safely close all of the Undici request pools. This step is will be removed before v1 release when an auto-close feature is added (https://github.com/nodejs/undici/pull/508).

```js
const fetch = require('undici-fetch')

async function run() {
	const res = await fetch('https://example.com')
	const json = await res.json()

	console.log(json)

	await fetch.close()
}

run()
```

> All mentions of `stream.Readable` or `Readable` in this documentation is referring to the Node.js Stream API [Readable Class](https://nodejs.org/api/stream.html#stream_class_stream_readable)

Keep in mind that many of these classes were designed to be directly integrated with Undici and thus may not offer the best stand-alone dev experience. They follow the fetch spec as close as possible and should not deviate from that spec API.

## Default Method: `fetch(resource, [init])`

* **resource** `string | Request`
* **init** `object` (optional)
  * **method** `string` (optional) - Defaults to `'GET'`
  * **headers** `Headers | HeadersInit` (optional)
  * **body** `Readable | null` (optional)

Returns: `Promise<Response>`

```js
// import and initialize all-at-once
const fetch = require('undici-fetch')()

// Promise Chain
fetch('https://example.com')
	.then(res => res.json())
	.then(json => console.log(json))

// Async/Await
const res = await fetch('https://example.com')
const json = await res.json()
```

## Method: `buildFetch()`

Returns: [fetch](#default-method-fetchresource-init)

```js
const { buildFetch } = require('undici-fetch')
const fetch = buildFetch({ /* Undici.Pool options */ })
```

## Class: Headers

Represents a WHATWG Fetch Spec [Headers Class](https://fetch.spec.whatwg.org/#headers-class)

### `new Headers([init])`

* **init** `Iterable<[string, string]> | Record<string, string>` (optional) - Initial header list to be cloned into the new instance

```js
new Headers()

const headers = new Headers([
	["undici", "fetch"]
])

new Headers({
	"undici": "fetch"
})

new Headers(headers)
```

### Instance Methods

#### `Headers.append(name, value)`

* **name** `string`
* **value** `string`

Returns: `void`

Non-destructive operation for adding header entries. When called multiple times with the same _name_, the values will be collected in a list and returned together when retrieved using [Headers.get](#headersgetname).

```js
const headers = new Headers()

headers.append('undici', 'fetch')
headers.get('undici') // -> 'fetch'

headers.append('foobar', 'fuzz')
headers.append('foobar', 'buzz')
headers.get('foobar') // -> 'fuzz, buzz'
```

#### `Headers.delete(name)`

* **name** `string`

Returns: `void`

Removes a header entry. This operation is destructive and cannot be restored. Does **not** throw an error if the given _name_ does not exist. Reminder that [Headers.get](#headersgetname) will return `null` if the _name_ does not exist.

```js
const headers = new Headers()

headers.append('undici', 'fetch')

headers.get('undici') // -> 'fetch'

headers.delete('undici')

headers.get('undici') // -> null
```

#### `Headers.get(name)`

* **name** `string`

Returns: `string | null`

Retrieves a header entry. If the entry _name_ has multiple values, they are returned as a string joined by `','` characters. If the _name_ does not exist, this method returns null.

```js
const headers = new Headers()

headers.append('undici', 'fetch')
headers.get('undici') // -> 'fetch'

headers.append('foobar', 'fuzz')
headers.append('foobar', 'buzz')
headers.get('foobar') // -> 'fuzz, buzz'

headers.get('nodejs') // -> null
```

#### `Headers.has(name)`

* **name** `string`

Returns `boolean`

Checks for the existence of a given entry _name_.

```js
const headers = new Headers()

headers.append('undici', 'fetch')
headers.has('undici') // -> true
```

#### `Headers.set(name, value)`

* **name** `string`
* **value** `string`

Returns: `void`

Destructive operation that will override any existing values for the given entry _name_. For a non-destructive alternative see [Headers.append](#headersappendname-value).

```js
const headers = new Headers()

headers.set('foobar', 'fuzz')
headers.get('foobar') // -> 'fuzz'

headers.set('foobar', 'buzz')
headers.get('foobar') // -> 'buzz'
```

#### `Headers.values()`

Returns: `IteratableIterator<string>`

Each iteration of the headers `values()` iterator yields a header _value_

```js
const headers = new Headers()

headers.set('abc', '123')
headers.set('def', '456')
headers.set('ghi', '789')
headers.append('ghi', '012')

for (const value of headers.values()) {
	console.log(value)
}

// -> '123'
// -> '456'
// -> '789, 012'
```

#### `Headers.keys()`

Returns: `IteratableIterator<string>`

Each iteration of the headers `keys()` iterator yields a header _name_

```js
const headers = new Headers()

headers.set('abc', '123')
headers.set('def', '456')
headers.set('ghi', '789')
headers.append('ghi', '012')

for (const name of headers.keys()) {
	console.log(name)
}

// -> 'abc'
// -> 'def'
// -> 'ghi'
```

#### `Headers[Symbol.iterator]`

Returns: `Iterator<[string, string]>`

A Headers class instance is iterable. It yields each of its entries as a pair where the first value is the entry _name_ and the second value is the header _value_.

```js
const headers = new Headers()

headers.set('abc', '123')
headers.set('def', '456')
headers.set('ghi', '789')
headers.append('ghi', '012')

for (const [name, value] of headers) {
	console.log(name, value)
}

// -> 'abc', '123'
// -> 'def', '456'
// -> 'ghi', '789, 012'
```
#### `Headers.entries()`

Returns: `IteratableIterator<[string, string]>`

Each iteration of the headers `entries()` iterator yields the same entry result as the default iterator

## Class: Body

Represents a WHATWG Fetch Spec [Body Mixin](https://fetch.spec.whatwg.org/#body-mixin)

### `new Body([input])`

* **input** `Readable | null | undefined` (optional) - Defaults to `null`

This class is the core for the [Request](#class-request) and [Response](#class-response) classes. Since this class is only ever going to recieve response data from Undici requests, it only supports Readable streams.

```js
new Body()
new Body(undefined)
new Body(null)
new Body(Readable.from('undici-fetch', { objectMode: false }))
```

### Instance Properties

#### `Body.body`

* `Readable | null`

A property representing the payload of the Body instance

#### `Body.bodyUsed`

* `boolean`

A property representing the consumption state of the Body instance. Do not confuse this property with the Node.js [stream](https://nodejs.org/api/stream.html#stream_three_states) state of `Body.body`. This property is used by the other instance methods for indicating to other parts of the API if the body has been consumed or not.

### Instance Methods

#### `Body.arrayBuffer()`

Returns: `Promise<Buffer>`

Returns the `Body.body` content as a Node.js [Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer) instance.

```js
const body = new Body(Readable.from('undici-fetch', { objectMode: false }))

const buf = await body.arrayBuffer()
console.log(buf instanceof Buffer) // -> true
console.log(buf.toString('utf8')) // -> 'undici-fetch'
```

#### `Body.blob()`

Returns: `never`

Currently, this implementation does not support returning content as a blob. Calling this method will throw an error. This may change in future API updates.

```js
const body = new Body(new Readable())

try {
	await body.blob()
} catch (err) {
	console.log(err.message) // -> 'Body.blob() is not supported yet by undici-fetch'
}
```

#### `Body.formData()`

Returns: `never`

Currently, this implementation does not support returning content as a blob. Calling this method will throw an error. This may change in future API updates.

```js
const body = new Body(new Readable())

try {
	await body.formData()
} catch (err) {
	console.log(err.message) // -> 'Body.formData() is not supported yet by undici-fetch'
}
```

#### `Body.json()`

Returns: `Promise<any>`

Returns the `Body.body` content as a JSON object.

```js
const content = JSON.stringify({ undici: 'fetch' })
const body = new Body(Readable.from(content, { objectMode: false }))

const res = await body.json()

console.log(res) // -> { undici: 'fetch' }
```

#### `Body.text()`

Returns: `Promise<string>`

Returns the `Body.body` content as a UTF-8 string.

```js
const body = new Body(Readable.from('undici-fetch', { objectMode: false }))

const res = await body.text()

console.log(res) // -> 'undici-fetch'
```

## Class: Request

Extends: `Body`

Represents a WHATWG Fetch Spec [Request Class](https://fetch.spec.whatwg.org/#request-class)

### `new Request(input, [init])`
* **input** `Request | string`
* **init** `object` (optional)
  * **method** `string` (optional) - Defaults to `'GET'`
  * **headers** `Headers | HeadersInit` (optional)
  * **body** `Readable | null | undefined` (optional)

Creates a new `Request` object. The resulting instance can be passed directly to the [fetch](#method-fetchresource-init) method. The input string will be transformed into a Node.js [URL](https://nodejs.org/api/url.html#url_class_url) instance.

```js
const request = new Request('https://example.com', {
	method: 'POST',
	body: Readable.from('undici-fetch', { objectMode: false })
})

const res = await fetch(request)
```

### Instance Properties:

#### `Request.url`

* `URL`

A Node.js [URL Class](https://nodejs.org/api/url.html#url_class_url) instance representing the destination of the Request instance

#### `Request.method`

* `string`

A property representing the type of the Request instance. Will be normalized to uppercase format and validated as one of [`http.METHODS`](https://nodejs.org/api/http.html#http_http_methods).

#### `Request.headers`

* `Headers`

A [Headers](#class-headers) class instance representing the Headers instance for the request instance.

### Instance Methods:

#### `Request.clone()`

Returns: `Request`

Will throw an `Error` if the current instance `Responce.bodyUsed` is `true`. Returns a new Request instance based on the existing instance.

```js
const request = new Request('https://example.com')

const newRequest = request.clone()

console.log(newRequest.url) // => 'https://example.com'
```

## Class: Response

Extends: `Body`

Represents a WHATWG Fetch Spec [Response Class](https://fetch.spec.whatwg.org/#response-class)

### `new Response(body, [init])`

* **body** `Readable | null | undefined`
* **init** `object` (optional)
  * **status** `number` (optional) - Defaults to `200`
  * **statusText** `string` (optional) - Defaults to `''`
  * **headers** `Headers | HeadersInit` (optional)

Creates a new `Response` object. This is the result resolved from a successful `fetch()` call. Remember that this class extends from [Body](#class-body) so you can use methods such as `.text()` and `.json()`.

```js
const response = new Response(Readable.from('undici-fetch', { objectMode: false }))

if (response.ok) {
	const text = await response.text()

	console.log(text) // -> 'undici-fetch'
}
```

### Instance Properties

#### `Response.headers`

* `Headers`

A property representing a [Headers](#class-headers) instance for the response.

#### `Response.ok`

* `boolean`

A property representing if the response is _ok_. A Response is considered _ok_ if the `status` is between 200 and 299 inclusive.

#### `Response.status`

* `number`

A property representing the status code of the response.

#### `Response.statusText`

* `string`

A property representing the status of the response instance based on [`http.STATUS_CODES`](https://nodejs.org/api/http.html#http_http_status_codes).

#### `Response.type`

* `string`

Defaults to `'default'`. A property representing the type of response instance. Currently only used to indicate an error response from [`Response.error()`](#responseerror).

### Instance Methods

#### `Response.clone()`

Returns: `Response`

Will throw an `Error` if the current instance `Responce.bodyUsed` is `true`.

### Static Methods

#### `Response.error()`

Returns: `Response`

Generates a Response instance with `type` set to `'error'` and a `body` set to `null`.

```js
const errorResponse = Response.error()
```

#### `Response.redirect(url, status)`

* **url** `string` - The redirect location--will be assigned to a `'location'` header
* **status** `number` - Must be one of: 301, 302, 303, 307, or 308

Returns: `Response`

```js
const redirectResponse = Response.redirect('https://example.com', 301)
```

---

# TypeScript

Similar to Undici, this module ships with its own TypeScript definitions. Make sure to install `@types/node` as well.

# Spec Omissions

Fetch is a browser API, but this library is written in Node.js. We try to be as spec compliant as possible; however, some aspects just cannot be recreated on the server. **All Fetch WHATWG Spec omissions are detailed here**. Each part should have a summary of the omission, plus links to relevant spec section and additional documentation.

Entries in this section have been considered for the implementation and explicitly ommitted. If you do not find an aspect of the Fetch API listed here that is **also** missing from the implementation, open an issue describing the feature request.
