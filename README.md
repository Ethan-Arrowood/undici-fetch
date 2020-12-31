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
	- [Class: Body](#class-body)
		- [`new Body([input])`](#new-bodyinput)
		- [Instance Properties](#instance-properties)
			- [`Body.body`](#bodybody)
			- [`Body.bodyUsed`](#bodybodyused)
		- [Instance Methods](#instance-methods)
			- [`arrayBuffer()`](#arraybuffer)
			- [`blob()`](#blob)
			- [`formData()`](#formdata)
			- [`json()`](#json)
			- [`text()`](#text)
	- [Class: Request](#class-request)
		- [`new Request(input, [init])`](#new-requestinput-init)
		- [Instance Properties:](#instance-properties-1)
			- [`Request.url`](#requesturl)
			- [`Request.method`](#requestmethod)
			- [`Request.headers`](#requestheaders)
		- [Instance Methods:](#instance-methods-1)
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
		- [Instance Methods](#instance-methods-2)
			- [`Response.clone()`](#responseclone)
- [Spec Omissions](#spec-omissions)

# API

The default export for this module is a function called `buildFetch` that returns a `fetch` function instance. `buildFetch` should only be called once; the `fetch` instance can and should be used multiple times throughout a project.

Behind the scenes, `undici-fetch` reuses [Undici.Pool](https://github.com/nodejs/undici#new-undicipoolurl-opts) instances for every unique request url origin. The request pools are memoized in a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) that is initialized in the `buildFetch` closure.

**Notice:** You must call `fetch.close()` at the end of your project in order to safely close all of the Undici request pools. This step is will be removed before v1 release when an auto-close feature is added.

## Default Method: `buildFetch()`

Returns: [fetch](#fetchresource-init)

```js
const buildFetch = require('undici-fetch')
const fetch = buildFetch()
```
## Method: `fetch(resource, [init])`

* `resource` String | [Request][]
* `init` Object (optional)
  * `method` String (optional) - Defaults to `'GET'`
  * `headers` Headers | HeadersInit (optional)
  * `body` stream.Readable | null (optional)

Returns: `Promise<Response>`
```js
const fetch = require('undici-fetch')() // import and initialize all-at-once
```

## Class: Headers

## Class: Body

Represents a WHATWG Fetch Spec [Body Mixin](https://fetch.spec.whatwg.org/#body-mixin)

### `new Body([input])`
* `input` [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable) | null | undefined (optional) - Defaults to `null`

### Instance Properties

#### `Body.body`

* [`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable)

A property representing the payload of the Body instance

#### `Body.bodyUsed`

* `Boolean`

A property representing the consumption state of the Body instance. Do not confuse this property with the Node.js [stream]() state of `Body.body`. This property is used by the other instance methods for indicating to other parts of the API if the body has been consumed or not.

### Instance Methods

#### `arrayBuffer()`

Returns: Promise<[Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer) | null>

#### `blob()`

Returns: never

#### `formData()`

Returns: never

#### `json()`

Returns: Promise<unknown | null>

#### `text()`

Returns: Promise<String | null>

## Class: Request

Extends: [Body](#class-body)

Represents a WHATWG Fetch Spec [Request Class](https://fetch.spec.whatwg.org/#request-class)

### `new Request(input, [init])`
* `input` [Request](#class-request) | String
* `init` Object (optional)
  * `method` String (optional) - Defaults to `'GET'`
  * `headers` [Headers]() | [HeadersInit]() (optional)
  * `body` [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable) | null | undefined (optional)

Creates a new `Request` object.

### Instance Properties:

#### `Request.url`

* [`URL`](https://nodejs.org/api/url.html#url_class_url)

A property representing the destination of the Request instance

#### `Request.method`

* `String`

A property representing the type of the Request instance. Will be normalized to uppercase format and validated as one of [`http.METHODS`](https://nodejs.org/api/http.html#http_http_methods).

#### `Request.headers`

* [`Headers`](#class-headers)

A property representing the Headers instance for the request instance.

### Instance Methods:

#### `clone()`

Returns: [Request](#class-request)

Will throw an `Error` if the current instance `Responce.bodyUsed` is `true`.

## Class: Response

Extends: [Body](#class-body)

Represents a WHATWG Fetch Spec [Response Class](https://fetch.spec.whatwg.org/#response-class)

### `new Response(body, [init])`

* `body` [stream.Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable) | null | undefined
* `init` Object (optional)
  * `status` Number - Defaults to `200`
  * `statusText` String - Defaults to `''`
  * `headers` [Headers]() | [HeadersInit]() (optional)

Creates a new `Response` object

### Static Methods

#### `Response.error()`

Returns: [`Response`](#class-response)

Generates a Response instance with `type` set to `'error'` and a `body` set to `null`.

#### `Response.redirect(url, status)`

* `url` String - The redirect location--will be assigned to a `'location'` header
* `status` Number - Must be one of: 301, 302, 303, 307, or 308

Returns: [`Response`](#class-response)

### Instance Properties

#### `Response.headers`

* [`Headers`](#class-headers)

A property representing a Header instance for the response instance

#### `Response.ok`

* `Boolean`

A property representing if the response is _ok_. A Response is considered _ok_ if the `status` is between 200 and 299 inclusive.

#### `Response.status`

* `Number`

A property representing the status code of the response instance.

#### `Response.statusText`

* `String`

A property representing the status of the response instance based on [`http.STATUS_CODES`](https://nodejs.org/api/http.html#http_http_status_codes).

#### `Response.type`

* `String`

Defaults to `'default'`. A property representing the type of response instance. Currently only used to indicate an error response from [`Response.error()`](#responseerror)

### Instance Methods

#### `Response.clone()`

Returns: [`Response`](#class-response)

Will throw an `Error` if the current instance `Responce.bodyUsed` is `true`.

--

# Spec Omissions

Fetch is a browser API, but this library is written in Node.js. We try to be as spec compliant as possible; however, some aspects just cannot be recreated on the server. **All Fetch WHATWG Spec omissions are detailed here**. Each part should have a summary of the omission, plus links to relevant spec section and additional documentation.

Entries in this section have been considered for the implementation and explicitly ommitted. If you do not find an aspect of the Fetch API listed here that is **also** missing from the implementation, open an issue describing the feature request.