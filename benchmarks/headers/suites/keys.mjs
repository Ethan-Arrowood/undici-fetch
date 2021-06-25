import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'

const keys = _ => headers => _ => {
  const noop = () => {}
  for (const key of headers.keys()) {
    noop(key)
  }
  return [headers]
}

export function keysSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'keys' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: keys.toString()
    }
  })
}
