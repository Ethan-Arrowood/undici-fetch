'use strict'

const kBody = Symbol('body')
const kBodyUsed = Symbol('bodyUsed')

class Body {
  constructor (input = null) {
    this[kBody] = input
    this[kBodyUsed] = false
  }

  get body() {
    return this[kBody]
  }

  get bodyUsed() {
    return this[kBodyUsed]
  }

  async arrayBuffer () {

  }

  async blob () {

  }

  async formData () {

  }

  async json () {
    let res = ''
    for await (const chunk of this[kBody]) {
      res += chunk
    }
    this[kBodyUsed] = true
    return JSON.parse(res)
  }

  async text () {
    let res = ''
    for await (const chunk of this[kBody]) {
      res += chunk
    }
    this[kBodyUsed] = true
    return res
  }
}

module.exports = Body
