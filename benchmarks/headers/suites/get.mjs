import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'
import { assertOrder } from './scripts/assertOrder.mjs'

const get = _ => headers => commonHeaderKeys => {
  for (const key of commonHeaderKeys) {
    headers.get(key)
  }

  return [headers]
}

export function getSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'get' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: get.toString(),
      args: [commonHeaderKeys]
    },
    after: {
      func: assertOrder.toString(),
      args: [entity.id, commonHeaderKeys]
    }
  })
}
