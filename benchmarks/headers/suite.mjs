import { parentPort, workerData } from 'node:worker_threads'
import { getHeaderClass } from './utils.mjs'

const {
  module,
  operation,
  beforeScript,
  testScript,
  afterScript,
} = workerData

const getScript = async script => {
  return script ? (await import(script.path)).default : undefined
}

const before = await getScript(beforeScript)
const test = await getScript(testScript)
const after = await getScript(afterScript)

const HeaderClass = getHeaderClass(module)

const headers = new HeaderClass()

if (before) {
  before(headers, ...(beforeScript.args ?? []))
}

const startTime = process.hrtime.bigint()

test(headers, ...(testScript.args ?? []))

const endTime = process.hrtime.bigint()

if (after) {
  after(headers, ...(afterScript.args ?? []))
}

parentPort.postMessage({
  operation,
  module,
  startTime,
  endTime
})

process.exit(0)
