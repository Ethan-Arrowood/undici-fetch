# undici-fetch

```sh
npm i undici-fetch
```

Built on [Undici](https://github.com/nodejs/undici)

# Benchmarks

View all benchmarks [here](./benchmarks.md)

# API

The default export for this module is a fetch client instance [`fetch`](). It uses the top level `Undici.Request()` method. This project exposes the global dispatcher methods `getGlobalDispatcher` and `setGlobalDispatcher` if they need special configuration.

## Exports

_default_: [`fetch`](#default-method-fetchresource-init)

_named exports_:
* [`Request`](#class-request)
* [`Response`](#class-response)
* [`Headers`](#class-headers)
* [`setGlobalDispatcher`](https://undici.nodejs.org/#/?id=undicisetglobaldispatcherdispatcher)
* [`getGlobalDispatcher`](https://undici.nodejs.org/#/?id=undicigetglobaldispatcher)

## Default Method: `fetch(resource, [init])`

* **resource** `string | Request | URL`
* **init** `RequestInit` (optional)

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

## Class: Headers

Represents a WHATWG Fetch Spec [Headers Class](https://fetch.spec.whatwg.org/#headers-class)

### `new Headers([init])`

* **init** `Headers | Iterable<[string, string]> | string[] | Record<string, string>` (optional) - Initial header list to be cloned into the new instance

```js
new Headers()

new Headers([
	["undici", "fetch"]
])

new Headers([ 'undici', 'fetch' ])

const headers = new Headers({
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

When _value_ is not a `string`, the _value_ will be stringified.

```js
const headers = new Headers()

headers.append('key', ['value', 'value2'])
headers.get('key') // -> 'value,value2'

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

When _value_ is not a `string`, the _value_ will be stringified.

```js
const headers = new Headers()

headers.set('foobar', 'fuzz')
headers.get('foobar') // -> 'fuzz'

headers.set('foobar', 'buzz')
headers.get('foobar') // -> 'buzz'
```

#### `Headers.values()`

Returns: `IteratableIterator<string>`

Yields a list of header values combined and sorted by their respective keys.

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

Yields a sorted list of header keys.

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
#### `Headers.forEach(callback, [thisArg])`

* **callback** `(value: string, key: string, iterable: Headers) => void`
* **thisArg** `any` (optional)

Returns: `void`

A Headers class can be iterated using `.forEach(callback, [thisArg])`.

Optionally a `thisArg` can be passed which will be assigned to the `this` context of callback.

The headers are returned in a sorted order, and values are combined on similar keys.

```js
const headers = new Headers([['abc', '123']])

headers.forEach(function (value, key, headers) {
	console.log(key, value)
})
// -> 'abc', '123'
```

#### `Headers[Symbol.iterator]`

Returns: `Iterator<[string, string]>`

A Headers class instance is iterable. It yields each of its entries as a pair where the first value is the entry _name_ and the second value is the header _value_. They are sorted by _name_ or otherwise referred to as the header key.

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

Yields a list of headers sorted and combined by key.

```js
const headers = new Headers()

headers.set('abc', '123')
headers.set('def', '456')
headers.set('ghi', '789')
headers.append('ghi', '012')

for (const entry of headers.entries()) {
	console.log(entry)
}

// -> 'abc', '123'
// -> 'def', '456'
// -> 'ghi', '789, 012'
```

## Class: Request

Implemets: `BodyMixin`

Represents a WHATWG Fetch Spec [Request Class](https://fetch.spec.whatwg.org/#request-class)

### `new Request(input, [init])`
* **input** `Request | string | URL`
* **init** `object` (optional)
  * **method** `string` (optional) - Defaults to `'GET'`
  * **headers** `Headers | HeadersInit` (optional)
  * **body** `AsyncIterable | Iterable | null | undefined` (optional)
	* **keepalive** `boolean` (optional)
	* **redirect** `string` (optional)
	* **integrity** `string` (optional)
	* **signal** `AbortSignal` (optional)

Creates a new `Request` object. The resulting instance can be passed directly to the [fetch](#method-fetchresource-init) method. The input string will be transformed into a Node.js [URL](https://nodejs.org/api/url.html#url_class_url) instance.

```js
const request = new Request('https://example.com', {
	method: 'POST',
	body: 'undici-fetch'
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

#### `Request.redirect`

* `string`

#### `Request.integrity`

* `string`

#### `Request.keepalive`

* `boolean`

#### `Request.signal`

* `AbortSignal`

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

* **body** `AsyncIterable | Iterable | null | undefined`
* **init** `object` (optional)
  * **status** `number` (optional) - Defaults to `200`
  * **statusText** `string` (optional) - Defaults to `''`
  * **headers** `Headers | HeadersInit` (optional)

Creates a new `Response` object. This is the result resolved from a successful `fetch()` call. Remember that this class extends from [Body](#class-body) so you can use methods such as `.text()` and `.json()`.

```js
const response = new Response('undici-fetch')

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

A property representing the status of the response instance. If returned from `fetch()`, it will be based on [`http.STATUS_CODES`](https://nodejs.org/api/http.html#http_http_status_codes).

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

## Function: BodyMixin

Represents a WHATWG Fetch Spec [Body Mixin](https://fetch.spec.whatwg.org/#body-mixin).

Use the mixin by called `BodyMixin` with the prototype of an object.

```js
class Response {
	constructor (body) {
		this[kBody] = body
	}
}

BodyMixin(Response.prototype)

const response = new Response('undici-fetch')

response.body // -> ControlledAsyncIterable from input 'undici-fetch'
```

### Properties

#### `body`

* `ControlledAsyncIterable | null`

A property representing the payload of the instance. `ControlledAsyncIterable` is a mock WHATWG Readable Stream. It implements the `disturbed` property so that the Fetch api can operate accordingly.

#### `bodyUsed`

* `boolean`

A property representing the consumption state of the instance. Do not confuse this property with the Node.js [stream](https://nodejs.org/api/stream.html#stream_three_states) state. This property is used by the other instance methods for indicating to other parts of the API if the body has been consumed or not.

### Methods

#### `arrayBuffer()`

Returns: `Promise<Buffer>`

Returns the `body` content as a Node.js [Buffer](https://nodejs.org/api/buffer.html#buffer_class_buffer) instance.

```js
const response = new Response('undici-fetch')

const buf = await response.arrayBuffer()
console.log(buf instanceof Buffer) // -> true
console.log(buf.toString('utf8')) // -> 'undici-fetch'
```

#### `blob()`

Returns: `never`

Currently, this implementation does not support returning content as a blob. Calling this method will throw an error. This may change in future API updates.

```js
const response = new Response('undici-fetch')

try {
	await response.blob()
} catch (err) {
	console.log(err.message) // -> 'Response.blob() is not supported yet by undici-fetch'
}
```

#### `formData()`

Returns: `never`

Currently, this implementation does not support returning content as a blob. Calling this method will throw an error. This may change in future API updates.

```js
const response = new Response('undici-fetch')

try {
	await response.formData()
} catch (err) {
	console.log(err.message) // -> 'Response.formData() is not supported yet by undici-fetch'
}
```

#### `json()`

Returns: `Promise<any>`

Returns the `body` content as a JSON object.

```js
const content = JSON.stringify({ undici: 'fetch' })
const response = new Response(content)

const data = await response.json()

console.log(data) // -> { undici: 'fetch' }
```

#### `text()`

Returns: `Promise<string>`

Returns the `body` content as a UTF-8 string.

```js
const response = new Response('undici-fetch')

const text = await response.text()

console.log(text) // -> 'undici-fetch'
```

---

# TypeScript

Similar to Undici, this module ships with its own TypeScript definitions. Make sure to install `@types/node` as well.

# Spec Omissions

Fetch is a browser API, but this library is written in Node.js. We try to be as spec compliant as possible; however, some aspects just cannot be recreated on the server. **All Fetch WHATWG Spec omissions are detailed here**. Each part should have a summary of the omission, plus links to relevant spec section and additional documentation.

Entries in this section have been considered for the implementation and explicitly ommitted. If you do not find an aspect of the Fetch API listed here that is **also** missing from the implementation, open an issue describing the feature request.

## CORS

Any CORS-related aspects of the Fetch api has been omitted from this implementation.