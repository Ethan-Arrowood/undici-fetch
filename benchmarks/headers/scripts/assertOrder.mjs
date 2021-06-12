import assert from 'node:assert'
export default (headers, module, commonHeaderKeys) => {
  // node-fetch doesn't sort correctly, so skip https://github.com/node-fetch/node-fetch/issues/1119
  if (module === 'node-fetch') { return }
  const sortedAndNormalizedCommonHeaderKeys = commonHeaderKeys.map(name => name.toLowerCase()).sort()
  let i = 0
  for (const key of headers.keys()) {
    const expectedHeaderName = sortedAndNormalizedCommonHeaderKeys[i++]
    assert(key === expectedHeaderName, `Invalid sort from module ${module}. Expected: ${expectedHeaderName} | Found: ${key}`)
  }
}
