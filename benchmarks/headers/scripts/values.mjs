export default (headers) => {
  const noop = () => {}
  for (const value of headers.values()) {
    noop(value)
  }
}
