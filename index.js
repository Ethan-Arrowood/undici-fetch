'use strict'

const { buildFetch, kAgent } = require('./src/fetch')

const fetch = buildFetch()

fetch.buildFetch = buildFetch
fetch.kAgent = kAgent

module.exports = fetch
