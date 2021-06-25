import { Worker } from 'worker_threads'

export async function benchmark (runs, baselineEntityId) {
  const runResults = await Promise.all(runs)
  const benchmarkResult = new Map()
  for (const result of runResults) {
    let suite = benchmarkResult.get(result.suite.id)
    if (suite === undefined) {
      suite = new Map()
      benchmarkResult.set(result.suite.id, suite)
    }
    suite.set(result.entity.id, result)
  }

  console.log('Benchmark Results')

  for (const [suiteId, suite] of benchmarkResult) {
    console.log(suiteId)
    const baselineRun = suite.get(baselineEntityId)
    if (baselineRun === undefined) {
      throw new Error(`Cannot find baseline run with entity id: ${baselineEntityId}`)
    }
    const baselineTime = calcElapsedTime(baselineRun.timings)
    const output = []
    for (const [entityId, run] of suite) {
      const totalTime = calcElapsedTime(run.timings)
      const percentChange = entityId === baselineEntityId
        ? null
        : calcPercentChange(baselineTime, totalTime)
      output.push({
        Entity: entityId,
        'Total Time': totalTimeToString(totalTime),
        'Percent Change': percentChange === null ? '0.000%' : percentChangeToString(percentChange)
      })
    }
    console.table(output)
  }
}

export function spawnRunWorker (runInput) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('worker.mjs', import.meta.url), {
      workerData: runInput
    })

    worker.on('message', resolve)
    worker.on('error', reject)

    worker.on('exit', code => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

export const getPath = p => new URL(p, import.meta.url).toString()

function calcElapsedTime (timings) {
  return Number.parseFloat((timings.endTime - timings.startTime).toString())
}

function calcPercentChange (baseTime, elapsedTime) {
  return ((elapsedTime - baseTime) / baseTime) * 100
}

function totalTimeToString (totalTime) {
  return `${totalTime}ns (${(totalTime * 0.000001).toFixed(3)}ms)`
}

function percentChangeToString (percentChange) {
  return `${percentChange.toFixed(3)}%`
}
