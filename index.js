'use strict'

const { setGlobalDispatcher, getGlobalDispatcher } = require('undici')
const { fetch } = require('./src/fetch')

fetch.setGlobalDispatcher = setGlobalDispatcher
fetch.getGlobalDispatcher = getGlobalDispatcher

module.exports = fetch
