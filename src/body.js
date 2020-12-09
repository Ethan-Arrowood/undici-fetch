'use strict'

const kBody = Symbol('body')
const kBodyUsed = Symbol('bodyUsed')

class Body {
  constructor (input = null) {
    this[kBody] = input
    this[kBodyUsed] = false
  }

  get body () {
    return this[kBody]
  }

  get bodyUsed () {
    return this[kBodyUsed]
  }

  async arrayBuffer () {
    const acc = []
    for await (const chunk of this[kBody]) {
      acc.push(chunk)
    }
    return Buffer.from(acc)
  }

  async blob () {
    // discuss later
    throw Error('Body.blob() is not supported yet by undici-fetch')
  }

  async formData () {
    // discuss later
    throw Error('Body.formData() is not supported yet by undici-fetch')
  }

  async json () {
    return JSON.parse(await this.text())
  }

  async text () {
    this[kBody].setEncoding('utf8')
    let res = ''
    for await (const chunk of this[kBody]) {
      res += chunk
    }
    this[kBodyUsed] = true
    return res
  }
}

module.exports = Body
