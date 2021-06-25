import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'
import { assertEmpty } from './scripts/assertEmpty.mjs'

const deleteFunc = _ => headers => commonHeaderKeys => {
  for (const key of commonHeaderKeys) {
    headers.delete(key)
  }

  return [headers]
}

export function deleteSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'delete' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: deleteFunc.toString(),
      args: [commonHeaderKeys]
    },
    after: {
      func: assertEmpty.toString(),
      args: [entity.id]
    }
  })
}
