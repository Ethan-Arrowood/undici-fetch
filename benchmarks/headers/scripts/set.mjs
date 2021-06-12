export default (headers, commonHeaderKeys) => {
  for (const key of commonHeaderKeys) {
    headers.set(key, 'A-String-Value-That-Represents-Average-Header-Value-Length')
  }
}
