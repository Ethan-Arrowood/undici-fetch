export const assertOrder = _ => headers => (moduleID, commonHeaderKeys) => {
  // node-fetch doesn't sort correctly, so skip https://github.com/node-fetch/node-fetch/issues/1119
  if (moduleID === 'node-fetch') { return }
  const sortedAndNormalizedCommonHeaderKeys = commonHeaderKeys.map(name => name.toLowerCase()).sort()
  let i = 0
  for (const key of headers.keys()) {
    const expectedHeaderName = sortedAndNormalizedCommonHeaderKeys[i++]
    if (!key === expectedHeaderName) {
      throw new Error(`Invalid sort from module ${moduleID}. Expected: ${expectedHeaderName} | Found: ${key}`)
    }
  }
}
