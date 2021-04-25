'use strict'

const { fetch } = require('./src/fetch')
const { buildFetch } = require('./src/buildFetch')

fetch.buildFetch = buildFetch

module.exports = fetch
