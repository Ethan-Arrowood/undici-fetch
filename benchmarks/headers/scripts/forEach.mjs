export default (headers) => {
  const noop = () => {}
  headers.forEach(header => noop(header))
}
