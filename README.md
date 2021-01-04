# undici-fetch

```sh
npm i undici-fetch
```

Quick Start:

```js
const fetch = require('undici-fetch')() // be sure to instantiate the undici-fetch instance

async function run () {
	const res = await fetch('https://github.com')
	const text = await res.text()

	console.log(text)
}

run()
```

## Table of Contents

- [undici-fetch](#undici-fetch)
	- [Table of Contents](#table-of-contents)
- [API](#api)
	- [Default Method: `buildFetch()`](#default-method-buildfetch)
	- [Method: `fetch(resource, [init])`](#method-fetchresource-init)
	- [Class: Headers](#class-headers)
		- [`new Headers([init])`](#new-headersinit)
		- [Instance Methods](#instance-methods)
			- [`Headers.append(name, value)`](#headersappendname-value)
			- [`Headers.delete(name)`](#headersdeletename)
			- [`Headers.get(name)`](#headersgetname)
			- [`Headers.has(name)`](#headershasname)
			- [`Headers.set(name, value)`](#headerssetname-value)
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
			- [`clone()`](#clone)
	- [Class: Response](#class-response)
		- [`new Response(body, [init])`](#new-responsebody-init)
		- [Static Methods](#static-methods)
			- [`Response.error()`](#responseerror)
			- [`Response.redirect(url, status)`](#responseredirecturl-status)
		- [Instance Properties](#instance-properties-2)
			- [`Response.headers`](#responseheaders)
			- [`Response.ok`](#responseok)
			- [`Response.status`](#responsestatus)
			- [`Response.statusText`](#responsestatustext)
			- [`Response.type`](#responsetype)
		- [Instance Methods](#instance-methods-3)
			- [`Response.clone()`](#responseclone)
- [Spec Omissions](#spec-omissions)

# API

The default export for this module is a function called `buildFetch` that returns a `fetch` function instance. `buildFetch` should only be called once; the `fetch` instance can and should be used multiple times throughout a project.

Behind the scenes, `undici-fetch` reuses [Undici.Pool](https://github.com/nodejs/undici#new-undicipoolurl-opts) instances for every unique request url origin. The request pools are memoized in a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) that is initialized in the `buildFetch` closure.

**Notice:** You must call `fetch.close()` at the end of your project in order to safely close all of the Undici request pools. This step is will be removed before v1 release when an auto-close feature is added.

> All mentions of `stream.Readable` or `Readable` in this documentation is referring to the Node.js Stream API [Readable Class](https://nodejs.org/api/stream.html#stream_class_stream_readable)

## Default Method: `buildFetch()`

Returns: [fetch](#fetchresource-init)

```js
const buildFetch = require('undici-fetch')
const fetch = buildFetch()
```
## Method: `fetch(resource, [init])`

* **resource** `string | Request`
* **init** `object` (optional)
  * **method** `string` (optional) - Defaults to `'GET'`
  * **headers** `Headers | HeadersInit` (optional)
  * **body** `Readable | null` (optional)

Returns: `Promise<Response>`

```js
// import and initialize all-at-once
const fetch = require('undici-fetch')() 
```

## Class: Headers

### `new Headers([init])`

* **init** `[string, string][] | Record<string, string>` (optional) - Initial header list to be cloned into the new instance

```js
new Headers()

new Headers([
	["undici", "fetch"]
])

new Headers({
	"undici": "fetch"
})
```

### Instance Methods

#### `Headers.append(name, value)`

* **name** `string`
* **value** `string`

Returns: `void`

#### `Headers.delete(name)`

* **name** `string`

Returns: `void`

#### `Headers.get(name)`

* **name** `string`

Returns: `string`

#### `Headers.has(name)`

* **name** `string`

Returns `boolean`

#### `Headers.set(name, value)`

* **name** `string`
* **value** `string`

Returns: `void`

#### `Headers[Symbol.iterator]`

Returns: `[string, string[]]`

## Class: Body

Represents a WHATWG Fetch Spec [Body Mixin](https://fetch.spec.whatwg.org/#body-mixin)

### `new Body([input])`
* **input** `Readable | null | undefined` (optional) - Defaults to `null`

### Instance Properties

#### `Body.body`

* `Readable | null`

A property representing the payload of the Body instance

#### `Body.bodyUsed`

* `boolean`

A property representing the consumption state of the Body instance. Do not confuse this property with the Node.js [stream]() state of `Body.body`. This property is used by the other instance methods for indicating to other parts of the API if the body has been consumed or not.

### Instance Methods

#### `Body.arrayBuffer()`

Returns: `Promise<Buffer | null>`

#### `Body.blob()`

Returns: `never`

#### `Body.formData()`

Returns: `never`

#### `Body.json()`

Returns: `Promise<unknown | null>`

#### `Body.text()`

Returns: `Promise<string | null>`

## Class: Request

Extends: `Body`

Represents a WHATWG Fetch Spec [Request Class](https://fetch.spec.whatwg.org/#request-class)

### `new Request(input, [init])`
* **input** `Request` | String
* **init** `object` (optional)
  * **method** `string` (optional) - Defaults to `'GET'`
  * **headers** `Headers | HeadersInit` (optional)
  * **body** `Readable | null | undefined` (optional)

Creates a new `Request` object.

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

#### `clone()`

Returns: `Request`

Will throw an `Error` if the current instance `Responce.bodyUsed` is `true`.

## Class: Response

Extends: `Body`

Represents a WHATWG Fetch Spec [Response Class](https://fetch.spec.whatwg.org/#response-class)

### `new Response(body, [init])`

* **body** `Readable | null | undefined`
* **init** `object` (optional)
  * **status** `number` - Defaults to `200`
  * **statusText** `string` - Defaults to `''`
  * **headers** `Headers | HeadersInit` (optional)

Creates a new `Response` object

### Static Methods

#### `Response.error()`

Returns: `Response`

Generates a Response instance with `type` set to `'error'` and a `body` set to `null`.

#### `Response.redirect(url, status)`

* **url** `string` - The redirect location--will be assigned to a `'location'` header
* **status** `number` - Must be one of: 301, 302, 303, 307, or 308

Returns: `Response`

### Instance Properties

#### `Response.headers`

* `Headers`

A property representing a Header instance for the response instance

#### `Response.ok`

* `boolean`

A property representing if the response is _ok_. A Response is considered _ok_ if the `status` is between 200 and 299 inclusive.

#### `Response.status`

* `number`

A property representing the status code of the response instance.

#### `Response.statusText`

* `string`

A property representing the status of the response instance based on [`http.STATUS_CODES`](https://nodejs.org/api/http.html#http_http_status_codes).

#### `Response.type`

* `string`

Defaults to `'default'`. A property representing the type of response instance. Currently only used to indicate an error response from [`Response.error()`](#responseerror)

### Instance Methods

#### `Response.clone()`

Returns: `Response`

Will throw an `Error` if the current instance `Responce.bodyUsed` is `true`.

---

# Spec Omissions

Fetch is a browser API, but this library is written in Node.js. We try to be as spec compliant as possible; however, some aspects just cannot be recreated on the server. **All Fetch WHATWG Spec omissions are detailed here**. Each part should have a summary of the omission, plus links to relevant spec section and additional documentation.

Entries in this section have been considered for the implementation and explicitly ommitted. If you do not find an aspect of the Fetch API listed here that is **also** missing from the implementation, open an issue describing the feature request.