export default (headers, commonHeaderKeys) => {
  for (const key of commonHeaderKeys) {
    headers.delete(key)
  }
}
