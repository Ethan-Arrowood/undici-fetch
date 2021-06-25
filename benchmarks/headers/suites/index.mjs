import { appendSuite } from './append.mjs'
import { setSuite } from './set.mjs'
import { hasSuite } from './has.mjs'
import { getSuite } from './get.mjs'
import { deleteSuite } from './delete.mjs'
import { iterateSuite } from './iterate.mjs'
import { forEachSuite } from './forEach.mjs'
import { entriesSuite } from './entries.mjs'
import { keysSuite } from './keys.mjs'
import { valuesSuite } from './values.mjs'
export const suites = [
  appendSuite,
  setSuite,
  hasSuite,
  getSuite,
  deleteSuite,
  iterateSuite,
  forEachSuite,
  entriesSuite,
  keysSuite,
  valuesSuite
]
