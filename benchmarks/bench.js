'use strict'

const { Writable } = require('stream')
const http = require('http')
const Benchmark = require('benchmark')
const undiciFetch = require('undici-fetch')()
const nodeFetch = require('node-fetch')
const os = require('os')
const path = require('path')

const connections = parseInt(process.env.CONNECTIONS, 10) || 50
const parallelRequests = parseInt(process.env.PARALLEL, 10) || 10
const pipelining = parseInt(process.env.PIPELINING, 10) || 10
const dest = {}

if (process.env.PORT) {
    dest.port = process.env.PORT
    dest.url = `http://localhost:${process.env.PORT}`
} else {
    dest.url = 'http://localhost'
    dest.socketPath = path.join(os.tmpdir(), 'undici.sock')
}

const suite = new Benchmark.Suite()

suite
    .add('undici-fetch', {
        defer: true,
        fn: deferred => {
            Promise.all(Array.from(Array(parallelRequests)).map(() => new Promise(resolve => {
                undiciFetch(dest.url)
                    .then(() => resolve())
            }))).then(() => deferred.resolve())
        }
    })
    .add('node-fetch', {
        defer: true,
        fn: deferred => {
            Promise.all(Array.from(Array(parallelRequests)).map(() => new Promise(resolve => {
                nodeFetch(dest.url)
                    .then(() => resolve())
            }))).then(() => deferred.resolve())
        }
    })
    .on('cycle', ({ target }) => {
        // Multiply results by parallelRequests to get opts/sec since we do mutiple requests
        // per run.
        target.hz *= parallelRequests
        console.log(String(target))
    })
    .on('complete', () => {
        client.destroy()
    })
    .run()