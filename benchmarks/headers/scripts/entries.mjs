export default (headers) => {
  const noop = () => {}
  for (const entry of headers.entries()) {
    noop(entry)
  }
}
