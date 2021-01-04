const fs = require('fs')

function printResults (suite) {
    for (const [testName, results] of Object.entries(suite)) {
        console.log(`Test: ${testName}\n`)
        for (const result of results) {
            const undiciFetchTotalTime = result['undici-fetch'].timeEnd - result['undici-fetch'].timeStart
            const nodeFetchTotalTime = result['node-fetch'].timeEnd - result['node-fetch'].timeStart
            const percentChange = ((undiciFetchTotalTime - nodeFetchTotalTime) / nodeFetchTotalTime) * 100
            console.log(`Iterations: ${result.iterations}\nundici-fetch total time: ${undiciFetchTotalTime}ms (${undiciFetchTotalTime/1000}s)\nnode-fetch total time: ${nodeFetchTotalTime}ms (${nodeFetchTotalTime/1000}s)\nPercent Change: ${percentChange}%\n`) 
        }
    }
}

function run () {
    const text = fs.readFileSync('result')
    const json = JSON.parse(text)
    printResults(json)
}

run ()