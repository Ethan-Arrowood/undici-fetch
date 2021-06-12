import assert from 'node:assert'
export default (headers, module, commonHeaderKeys) => {
  for (const key of commonHeaderKeys) {
    assert(headers.has(key), `Instance from module ${module} is missing header ${key}`)
  }
}
