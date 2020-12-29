'use strict'

const tap = require('tap')
const stream = require('stream')
const {
  isReadable,
  validateHeaderName,
  validateHeaderValue,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue,
  normalizeAndValidateHeaderArguments,
  HeaderNameValidationError,
  HeaderValueValidationError
} = require('../src/utils')
const {
  allValidHeaderNameCharacters,
  allValidHeaderValueCharacters
} = require('./testUtils')

tap.test('isReadable', t => {
  t.plan(4)

  t.ok(isReadable(new stream.Readable()))
  t.ok(isReadable(new stream.Duplex()))
  t.notOk(isReadable(new stream.Writable()))
  t.notOk(isReadable(new stream.Stream()))
})

tap.test('validateHeaderName', t => {
  t.plan(3)

  t.test('throws on undefined, null, and empty string entry', t => {
    t.plan(4)

    t.throw(() => validateHeaderName(), HeaderNameValidationError(), 'throws on empty header name')
    t.throw(() => validateHeaderName(undefined), HeaderNameValidationError(undefined), 'throws on undefined header name')
    t.throw(() => validateHeaderName(null), HeaderNameValidationError(null), 'throws on null header name')
    t.throw(() => validateHeaderName(''), HeaderNameValidationError(''), 'throws on empty string header name')
  })

  t.test('throws on invalid characters', { skip: true }, t => {
    t.plan(16)

    // 16 invalid characters found on an US keyboard. This test could be improved to cover other characters outside of the valid list
    const invalidChars = ['@', '(', ')', ':', ';', ',', '<', '>', '/', '\\', '?', '[', ']', '{', '}', '=']
    for (const char of invalidChars) {
      t.throw(() => validateHeaderName(char), HeaderNameValidationError(char), `throws on invalid header name character ${char}`)
    }
  })

  t.test('succeeds on valid name', t => {
    t.plan(2)

    t.notThrow(() => validateHeaderName('undici-fetch'))
    t.notThrow(() => validateHeaderName(allValidHeaderNameCharacters))
  })
})

tap.test('validateHeaderValue', t => {
  t.plan(3)

  t.test('throws on undefined, null, and empty string entry', t => {
    t.plan(4)

    const name = 'undici'
    t.throw(() => validateHeaderValue(name), HeaderValueValidationError(name), 'throws on empty header value')
    t.throw(() => validateHeaderValue(name, undefined), HeaderValueValidationError(name, undefined), 'throws on undefined header value')
    t.throw(() => validateHeaderValue(name, null), HeaderValueValidationError(name, null), 'throws on null header value')
    t.throw(() => validateHeaderValue(name, ''), HeaderValueValidationError(name, ''), 'throws on empty string header value')
  })

  t.test('throws on invalid characters', { skip: true }, t => {
    t.plan(0)

    // The invalid char codes for header values is more vague. Any proper way to test this?
  })

  t.test('succeeds on valid value', t => {
    t.plan(2)

    t.notThrow(() => validateHeaderValue('undici', 'fetch'))
    t.notThrow(() => validateHeaderValue('undici-fetch', allValidHeaderValueCharacters))
  })
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
