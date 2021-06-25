import { spawnRunWorker } from '../../benchmark.mjs'

import { getInitArg } from './scripts/getInitArg.mjs'
import { initializeHeaders } from './scripts/initializeHeaders.mjs'

const values = _ => headers => _ => {
  const noop = () => {}
  for (const value of headers.values()) {
    noop(value)
  }
  return [headers]
}

export function valuesSuite (entity, commonHeaderKeys) {
  return spawnRunWorker({
    entity,
    suite: { id: 'values' },
    before: {
      func: initializeHeaders.toString(),
      args: [getInitArg(commonHeaderKeys)]
    },
    main: {
      func: values.toString()
    }
  })
}
