'use strict'

const { promisify } = require('util')

const promisifyServerClose = server => promisify(server.close.bind(server))

// Header validation testing utils
const validHeaderNameRanges = [
  33,
  [35, 39],
  42,
  43,
  45,
  46,
  [48, 57],
  [65, 90],
  [94, 122],
  124,
  126
]

const validHeaderValueRanges = [
  9,
  [32, 126],
  [128, 255]
]

function generateCharacters (charCodeRanges) {
  let s = ''
  for (const range of charCodeRanges) {
    if (Array.isArray(range)) {
      for (let i = range[0]; i <= range[1]; i++) {
        s += String.fromCharCode(i)
      }
    } else {
      s += String.fromCharCode(range)
    }
  }
  return s
}

const allValidHeaderNameCharacters = generateCharacters(validHeaderNameRanges)
const allValidHeaderValueCharacters = generateCharacters(validHeaderValueRanges)

module.exports = {
  promisifyServerClose,
  allValidHeaderNameCharacters,
  allValidHeaderValueCharacters
}
