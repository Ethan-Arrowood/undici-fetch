import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'
import { assertOrder } from './scripts/assertOrder.mjs'

const has = _ => headers => commonHeaderKeys => {
  for (const key of commonHeaderKeys) {
    headers.has(key)
  }

  return [headers]
}

export function hasSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'has' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: has.toString(),
      args: [commonHeaderKeys]
    },
    after: {
      func: assertOrder.toString(),
      args: [entity.id, commonHeaderKeys]
    }
  })
}
