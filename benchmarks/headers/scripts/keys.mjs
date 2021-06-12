export default (headers) => {
  const noop = () => {}
  for (const key of headers.keys()) {
    noop(key)
  }
}
