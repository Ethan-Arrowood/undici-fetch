'use strict'

const { promisify } = require('util')

const promisifyServerClose = server => promisify(server.close.bind(server))

module.exports = {
  promisifyServerClose
}
