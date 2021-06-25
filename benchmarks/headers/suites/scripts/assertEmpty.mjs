export const assertEmpty = _ => headers => moduleID => {
  let n = 0
  for (const header of headers) {
    n++
  }

  if (n > 0) {
    throw new Error(`Instance from module ${moduleID} still contains ${n} entries`)
  }
}
