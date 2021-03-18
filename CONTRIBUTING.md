# Contributing

## Testing

### `t.teardown()` step

Many tests for this module require an http server. It is recommend to use a teardown method to safely close the server(s) and fetch clients. Additionally, due to the way http servers are closed in Node.js, you should close the fetch clients first then the http server(s). Furthermore, the `server.close` method is not promised based so in order to use it with `await`, use the `closeServer` utility method.

For example:

```js
t.teardown(async () => {
	await fetch.close()
	await closeServer(server)
})
```