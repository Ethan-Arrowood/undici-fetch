import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'

const entries = _ => headers => _ => {
  const noop = () => {}
  for (const entry of headers.entries()) {
    noop(entry)
  }
  return [headers]
}

export function entriesSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'entries' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: entries.toString()
    }
  })
}
