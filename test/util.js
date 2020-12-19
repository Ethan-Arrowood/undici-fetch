'use strict'

const { promisify } = require('util')

export const promisifyServerClose = server => promisify(server.close.bind(server))
