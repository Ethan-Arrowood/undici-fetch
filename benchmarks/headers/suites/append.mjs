import { spawnRunWorker } from '../../benchmark.mjs'

import { initializeHeaders } from './scripts/initializeHeaders.mjs'
import { assertOrder } from './scripts/assertOrder.mjs'

const append = _ => headers => commonHeaderKeys => {
  for (const key of commonHeaderKeys) {
    headers.append(key, 'A-String-Value-That-Represents-Average-Header-Value-Length')
  }
  return [headers]
}

export function appendSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'append' },
    before: {
      func: initializeHeaders.toString()
    },
    main: {
      func: append.toString(),
      args: [commonHeaderKeys]
    },
    after: {
      func: assertOrder.toString(),
      args: [entity.id, commonHeaderKeys]
    }
  })
}
