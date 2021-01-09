'use strict'

const buildFetch = require('./src/fetch')

const fetch = buildFetch()

fetch.buildFetch = buildFetch

module.exports = fetch
