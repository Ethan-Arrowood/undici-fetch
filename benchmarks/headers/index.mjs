import { Worker } from 'node:worker_threads'
import { commonHeaderKeys } from './utils.mjs'
import {
  calcElapsedTime,
  calcPercentChange,
  percentChangeToString,
  totalTimeToString
} from '../utils.mjs'

function printBenchmarkSuite (operation, benchmarks) {
  console.log(`Benchmark Suite results for operation: ${operation}`)
  const baselineTiming = calcElapsedTime(benchmarks['undici-fetch'])
  const output = Object.entries(benchmarks).map(([module, timings]) => {
    const totalTime = calcElapsedTime(timings)
    const percentChange = module === 'undici-fetch' ? null : calcPercentChange(baselineTiming, calcElapsedTime(timings))
    return {
      Module: module,
      'Total Time': totalTimeToString(totalTime),
      // 'Percent Change': percentChange !== null ? percentChangeToString(percentChange) : null,
      'Result': percentChange !== null ? `${percentChangeToString(Math.abs(percentChange))} ${percentChange > 0 ? 'slower' : 'faster'} than undici-fetch` : null
    }
  })
  console.table(output)
}

function printResults (results) {
  console.log('Benchmark results for Headers class')
  console.log(`Tested modules: ${results.modules.join(', ')}\n`)

  for (const [operation, benchmarks] of Object.entries(results.benchmarks)) {
    printBenchmarkSuite(operation, benchmarks)
  }
}

/** Shuffle list for accurate sorting benchmarks */
commonHeaderKeys.sort(() => Math.random() - 0.5)

function spawnSuite (workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL(`./suite.mjs`, import.meta.url),
      { workerData }
    )
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

const appendSuite = (module) => spawnSuite({
  module,
  operation: 'append',
  testScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ]
  },
  afterScript: {
    path: './scripts/assertOrder.mjs',
    args: [ module, commonHeaderKeys ]
  }
})

const setSuite = (module) => spawnSuite({
  module,
  operation: 'set',
  testScript: {
    path: './scripts/set.mjs',
    args: [ commonHeaderKeys ]
  },
  afterScript: {
    path: './scripts/assertHas.mjs',
    args: [ module, commonHeaderKeys ]
  }
})

const hasSuite = (module) => spawnSuite({
  module,
  operation: 'has',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ],
  },
  testScript: {
    path: './scripts/has.mjs',
    args: [ commonHeaderKeys ]
  },
  afterScript: {
    path: './scripts/assertOrder.mjs',
    args: [ module, commonHeaderKeys ]
  }
})

const getSuite = (module) => spawnSuite({
  module,
  operation: 'get',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ],
  },
  testScript: {
    path: './scripts/get.mjs',
    args: [ commonHeaderKeys ]
  },
  afterScript: {
    path: './scripts/assertOrder.mjs',
    args: [ module, commonHeaderKeys ]
  }
})

const deleteSuite = (module) => spawnSuite({
  module,
  operation: 'delete',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ],
  },
  testScript: {
    path: './scripts/delete.mjs',
    args: [ commonHeaderKeys ]
  }
})

const iterateSuite = (module) => spawnSuite({
  module,
  operation: 'iterate',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ]
  },
  testScript: {
    path: './scripts/iterate.mjs',
  }
})

const forEachSuite = (module) => spawnSuite({
  module,
  operation: 'forEach',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ]
  },
  testScript: {
    path: './scripts/forEach.mjs',
  }
})

const entriesSuite = (module) => spawnSuite({
  module,
  operation: 'entries',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ]
  },
  testScript: {
    path: './scripts/entries.mjs',
  }
})

const keysSuite = (module) => spawnSuite({
  module,
  operation: 'keys',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ]
  },
  testScript: {
    path: './scripts/keys.mjs',
  }
})

const valuesSuite = (module) => spawnSuite({
  module,
  operation: 'values',
  beforeScript: {
    path: './scripts/append.mjs',
    args: [ commonHeaderKeys ]
  },
  testScript: {
    path: './scripts/values.mjs',
  }
})

const modules = [ 'undici-fetch', 'node-fetch', './implementations/mapHeaders.js' ]
const suites = [
  appendSuite,
  deleteSuite,
  entriesSuite,
  forEachSuite,
  getSuite,
  hasSuite,
  iterateSuite,
  keysSuite,
  setSuite,
  valuesSuite,
]
const runs = modules.map(module => suites.map(suite => suite(module))).flat()

try {
  const values = await Promise.all(runs)

  const modules = new Set()
  const benchmarks = {}
  for (let i = 0; i < values.length; i++) {
    const { operation, module, ...rest } = values[i]
    modules.add(module)
    if (!benchmarks[operation]) benchmarks[operation] = {}
    benchmarks[operation][module] = rest
  }
  const results = {
    modules: Array.from(modules),
    benchmarks
  }
  printResults(results)
} catch (error) {
  console.error(error)
  process.exit(1)
}
