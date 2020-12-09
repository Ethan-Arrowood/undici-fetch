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

## Spec Omissions

Fetch is a browser API, but this library is written in Node.js. We try to be as spec compliant as possible; however, some aspects just cannot be recreated on the server. **All Fetch WHATWG Spec omissions are detailed here**. Each part should have a summary of the omission, plus links to relevant spec section and additional documentation.

Entries in this section have been considered for the implementation and explicitly ommitted. If you do not find an aspect of the Fetch API listed here that is **also** missing from the implementation, open an issue describing the feature request.