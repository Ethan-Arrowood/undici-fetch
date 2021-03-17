'use strict'

const tap = require('tap')
const stream = require('stream')
const { isReadable } = require('../src/utils')

tap.test('isReadable', t => {
  t.plan(4)

  t.ok(isReadable(new stream.Readable()))
  t.ok(isReadable(new stream.Duplex()))
  t.notOk(isReadable(new stream.Writable()))
  t.notOk(isReadable(new stream.Stream()))
})

tap.test('normalizeAndValidate utils', t => {
  t.plan(3)

  const nonNormalizedName = 'UNDICI'
  // this string contains four spaces in front and a tab character at the end
  const nonNormalizedValue = '    fetch	' // eslint-disable-line no-tabs

  const normalizedName = normalizeAndValidateHeaderName(nonNormalizedName)
  t.strictEqual(normalizedName, 'undici')

  const normalizedValue = normalizeAndValidateHeaderValue(nonNormalizedName, nonNormalizedValue)
  t.strictEqual(normalizedValue, 'fetch')

  const normalizedNameAndValue = normalizeAndValidateHeaderArguments(nonNormalizedName, nonNormalizedValue)
  t.strictDeepEqual(normalizedNameAndValue, ['undici', 'fetch'])
})
