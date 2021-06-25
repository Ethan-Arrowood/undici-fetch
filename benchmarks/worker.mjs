import { parentPort, workerData } from 'worker_threads'

const {
  entity,
  suite,
  before,
  main,
  after
} = workerData

const getScript = async (script) => {
  const module = await import(script.path)
  const scriptImport = module[script.import] || module.default[script.import]
  if (scriptImport === undefined) throw new Error(`Import ${script.import} not found from ${script.path}. Check the 'import' property on the script entry.`)
  return scriptImport
}

const evaluate = async (script, previousArgs = [], entityImport = []) => {
  if (!script) return
  return await (eval(script.func)(entityImport)(...previousArgs))(...script.args ?? []) // eslint-disable-line no-eval
}

async function run (parentPort) {
  const entityImport = await getScript(entity)

  const beforeResult = await evaluate(before, undefined, entityImport)

  const startTime = process.hrtime.bigint()

  const mainResult = await evaluate(main, beforeResult, entityImport)

  const endTime = process.hrtime.bigint()

  const afterResult = await evaluate(after, mainResult, entityImport)

  parentPort.postMessage({
    entity,
    suite,
    afterResult,
    timings: {
      startTime,
      endTime
    }
  })
}

if (parentPort === null) {
  throw new Error('This script must be executed as a worker_thread. parentPort is null')
}

run(parentPort)
