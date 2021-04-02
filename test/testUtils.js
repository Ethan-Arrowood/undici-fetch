'use strict'

const { promisify } = require('util')

const closeServer = server => promisify(server.close).call(server)

module.exports = {
  closeServer
}
