export const assertHas = _ => headers => (moduleID, commonHeaderKeys) => {
  for (const key of commonHeaderKeys) {
    if (!headers.has(key)) {
      throw new Error(`Instance from module ${moduleID} is missing header ${key}`)
    }
  }
}
