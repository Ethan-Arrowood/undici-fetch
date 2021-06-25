import { spawnRunWorker } from '../../benchmark.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'
import { assertHas } from './scripts/assertHas.mjs'

const set = _ => headers => commonHeaderKeys => {
  for (const key of commonHeaderKeys) {
    headers.set(key, 'A-String-Value-That-Represents-Average-Header-Value-Length')
  }

  return [headers]
}

export function setSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'set' },
    before: {
      func: initializeHeaders.toString()
    },
    main: {
      func: set.toString(),
      args: [commonHeaderKeys]
    },
    after: {
      func: assertHas.toString(),
      args: [entity.id, commonHeaderKeys]
    }
  })
}
