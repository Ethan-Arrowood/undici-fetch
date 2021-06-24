'use strict'

const { setGlobalDispatcher, getGlobalDispatcher } = require('undici')
const { fetch } = require('./src/fetch')

fetch.Request = require('./src/request').Request
fetch.Response = require('./src/response').Response
fetch.Headers = require('./src/headers').Headers

fetch.setGlobalDispatcher = setGlobalDispatcher
fetch.getGlobalDispatcher = getGlobalDispatcher

module.exports = fetch
