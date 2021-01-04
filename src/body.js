'use strict'

const { isReadable } = require('./utils')

const kBody = Symbol('body')
const kBodyUsed = Symbol('bodyUsed')

class Body {
  /**
   * @param {import('stream').Readable | null} input
   */
  constructor (input = null) {
    if (input != null && !isReadable(input)) {
      throw Error('body must be undefined, null, or a readable stream')
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
    if (this[kBody] == null) return Buffer.alloc(0)

    const acc = []
    for await (const chunk of this[kBody]) {
      if (!this[kBodyUsed]) this[kBodyUsed] = true
      acc.push(chunk)
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
    if (this[kBody] == null) return ''

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
