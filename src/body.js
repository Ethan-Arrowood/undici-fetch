'use strict'

class Body {
  constructor (stream) {
    this.body = stream
    this.bodyUsed = false
  }

  async arrayBuffer () {

  }

  async blob () {

  }

  async formData () {

  }

  async json () {
    let res = ''
    for await (const chunk of this.body) {
      res += chunk
    }
    this.bodyUsed = true
    return JSON.parse(res)
  }

  async text () {
    let res = ''
    for await (const chunk of this.body) {
      res += chunk
    }
    this.bodyUsed = true
    return res
  }
}

module.exports = Body
