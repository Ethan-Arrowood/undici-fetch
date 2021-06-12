export default (headers) => {
  const noop = () => {}
  for (const header of headers) {
    noop(header)
  }
}
