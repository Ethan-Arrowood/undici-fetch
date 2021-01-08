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

## Benchmarks

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

## Spec Omissions

Fetch is a browser API, but this library is written in Node.js. We try to be as spec compliant as possible; however, some aspects just cannot be recreated on the server. **All Fetch WHATWG Spec omissions are detailed here**. Each part should have a summary of the omission, plus links to relevant spec section and additional documentation.

Entries in this section have been considered for the implementation and explicitly ommitted. If you do not find an aspect of the Fetch API listed here that is **also** missing from the implementation, open an issue describing the feature request.