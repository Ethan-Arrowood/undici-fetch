'use strict'

const { isStream } = require('./util')

const kBody = Symbol('body')
const kBodyUsed = Symbol('bodyUsed')

class Body {
  /**
   * @param {import('stream').Readable | null} input 
   */
  constructor (input = null) {
    if (input != null && !isStream(input)) {
      throw Error('body must be nul or a readable stream')
    }

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
    if (this[kBody] == null) return null

    const acc = []
    for await (const chunk of this[kBody]) {
      if (!this[kBodyUsed]) this[kBodyUsed] = true
      acc.push(Buffer.from(chunk))
    }
    return Buffer.concat(acc)
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
    if (this[kBody] == null) return null

    this[kBody].setEncoding('utf8')
    let res = ''
    for await (const chunk of this[kBody]) {
      if (!this[kBodyUsed]) this[kBodyUsed] = true
      res += chunk
    }
    return res
  }
}

module.exports = Body
