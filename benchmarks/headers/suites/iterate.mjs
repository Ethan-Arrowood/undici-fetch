import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'

const iterate = _ => headers => _ => {
  const noop = () => {}
  for (const header of headers) {
    noop(header)
  }
  return [headers]
}

export function iterateSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'iterate' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: iterate.toString()
    }
  })
}
