export const assertEmpty = _ => headers => moduleID => {
  let n = 0
  headers.forEach(() => { n++ })
  if (n > 0) {
    throw new Error(`Instance from module ${moduleID} still contains ${n} entries`)
  }
}
