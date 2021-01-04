const http = require('http')

const { promisifyServerClose } = require('../test/testUtils')
const { promisify } = require('util')
const undiciFetch = require('../src/fetch')()
const nodeFetch = require('node-fetch')
const microtime = require('microtime')
const fs = require('fs')

function printResults (suite) {
    for (const [testName, results] of Object.entries(suite)) {
        console.log(`Test: ${testName}`)
        for (const result of results) {
            const undiciFetchTotalTime = result['undici-fetch'].timeEnd - result['undici-fetch'].timeStart
            const nodeFetchTotalTime = result['node-fetch'].timeEnd - result['node-fetch'].timeStart
            const percentChange = nodeFetchTotalTime / undiciFetchTotalTime * 100
            console.log(`Iterations: ${result.iterations}\nundici-fetch total time: ${undiciFetchTotalTime}ms (${undiciFetchTotalTime/1000}s)\nnode-fetch total time: ${nodeFetchTotalTime}(${nodeFetchTotalTime/1000}s)\nPercent Change: ${percentChange}%`) 
        }
    }
}

async function benchmark () {
    const tests = {
        'basicGet': basicGet
    }

    const results = {}
    for (const [testName, test] of Object.entries(tests)) {
        results[testName] = []
        for (let n = 1; n <= 100000; n *= 10) {
            const result = await test(n)
            // console.log(result)
            results[testName].push(result)
        }
    }
    await fs.promises.writeFile(`result-${microtime.now()}`, JSON.stringify(results))
    printResults(results)
}

function basicGet (N) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            res.end()
        })

        server.listen(0, async () => {
            const result = {
                iterations: N,
                'undici-fetch': {},
                'node-fetch': {}
            }

            result['undici-fetch'].timeStart = microtime.now()
            for (let i = 0; i < N; i++) {
                await undiciFetch(`http://localhost:${server.address().port}`)
            }
            result['undici-fetch'].timeEnd = microtime.now()
        
            result['node-fetch'].timeStart = microtime.now()
            for (let i = 0; i < N; i++) {
                await nodeFetch(`http://localhost:${server.address().port}`)
            }
            result['node-fetch'].timeEnd = microtime.now()

            await promisifyServerClose(server)()
            await undiciFetch.close()
            resolve(result)
        })
    })
}

benchmark()