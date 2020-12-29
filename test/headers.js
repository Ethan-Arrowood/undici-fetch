const tap = require('tap')
const Headers = require('../src/headers')
const {
  validateHeaderName,
  validateHeaderValue,
  normalizeAndValidateHeaderName,
  normalizeAndValidateHeaderValue,
  normalizeAndValidateHeaderArguments,
  HeaderNameValidationError,
  HeaderValueValidationError
} = require('../src/utils')

tap.test('Headers initialization', t => {
  t.plan(4)

  t.test('allows undefined', t => {
    t.plan(1)

    t.notThrow(() => new Headers())
  })

  t.test('with array of header entries', t => {
    t.plan(2)

    t.test('fails with odd length init child', t => {
      t.plan(1)
      const init = [['undici', 'fetch'], ['fetch']]
      t.throw(() => new Headers(init), TypeError('header entry must be of length two'))
    })

    t.test('allows even length init', t => {
      t.plan(1)
      const init = [['undici', 'fetch'], ['fetch', 'undici']]
      t.notThrow(() => new Headers(init))
    })
  })

  t.test('with object of header entries', t => {
    t.plan(1)
    const init = {
      undici: 'fetch',
      fetch: 'undici'
    }
    t.notThrow(() => new Headers(init))
  })

  t.test('fails silently if primitive object is passed', t => {
    t.plan(5)
    t.notThrow(() => new Headers(Number))
    t.notThrow(() => new Headers(Boolean))
    t.notThrow(() => new Headers(String))
    t.notThrow(() => new Headers(Array))
    t.notThrow(() => new Headers(Function))
  })
})

tap.test('validateHeaderName', t => {
  t.plan(2)

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
})

tap.test('validateHeaderValue', t => {
  t.plan(2)

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

tap.test('Headers append', t => {
  t.plan(3)

  t.test('adds valid header entry to instance', t => {
    t.plan(2)
    const headers = new Headers()

    const name = 'undici'
    const value = 'fetch'
    t.notThrow(() => headers.append(name, value))
    t.strictEqual(headers.get(name), value)
  })

  t.test('adds valid header to existing entry', t => {
    t.plan(3)
    const headers = new Headers()

    const name = 'undici'
    const value1 = 'fetch1'
    const value2 = 'fetch2'
    headers.append(name, value1)
    t.strictEqual(headers.get(name), value1)
    t.notThrow(() => headers.append(name, value2))
    t.strictEqual(headers.get(name), [value1, value2].join(', '))
  })

  t.test('throws on invalid entry', t => {
    t.plan(3)
    const headers = new Headers()

    t.throw(() => headers.append(), 'throws on missing name and value')
    t.throw(() => headers.append('undici'), 'throws on missing value')
    t.throw(() => headers.append('invalid @ header ? name', 'valid value'), 'throws on invalid name')
  })
})

tap.test('Headers delete', t => {
  t.plan(2)

  t.test('deletes valid header entry from instance', t => {
    t.plan(3)
    const headers = new Headers()

    const name = 'undici'
    const value = 'fetch'
    headers.append(name, value)
    t.strictEqual(headers.get(name), value)
    t.notThrow(() => headers.delete(name))
    t.strictEqual(headers.get(name), null)
  })

  t.test('throws on invalid entry', t => {
    t.plan(2)
    const headers = new Headers()

    t.throw(() => headers.delete(), 'throws on missing namee')
    t.throw(() => headers.delete('invalid @ header ? name'), 'throws on invalid name')
  })
})

tap.test('Headers get', t => {
  t.plan(3)

  t.test('returns null if not found in instance', t => {
    t.plan(1)
    const headers = new Headers()

    t.strictEqual(headers.get('undici'), null)
  })

  t.test('returns header values from valid header name', t => {
    t.plan(2)
    const headers = new Headers()

    const name = 'undici'; const value1 = 'fetch1'; const value2 = 'fetch2'
    headers.append(name, value1)
    t.strictEqual(headers.get(name), value1)
    headers.append(name, value2)
    t.strictEqual(headers.get(name), [value1, value2].join(', '))
  })

  t.test('throws on invalid entry', t => {
    t.plan(2)
    const headers = new Headers()

    t.throw(() => headers.get(), 'throws on missing name')
    t.throw(() => headers.get('invalid @ header ? name'), 'throws on invalid name')
  })
})

tap.test('Headers has', t => {
  t.plan(2)

  t.test('returns boolean existance for a header name', t => {
    t.plan(2)
    const headers = new Headers()

    const name = 'undici'
    t.strictEqual(headers.has(name), false)
    headers.append(name, 'fetch')
    t.strictEqual(headers.has(name), true)

  })

  t.test('throws on invalid entry', t => {
    t.plan(2)
    const headers = new Headers()

    t.throw(() => headers.has(), 'throws on missing name')
    t.throw(() => headers.has('invalid @ header ? name'), 'throws on invalid name')
  })
})

tap.test('Headers set', t => {
  t.plan(3)

  t.test('sets valid header entry to instance', t => {
    t.plan(2)
    const headers = new Headers()

    const name = 'undici'
    const value = 'fetch'
    t.notThrow(() => headers.set(name, value))
    t.strictEqual(headers.get(name), value)
  })

  t.test('overwrites existing entry', t => {
    t.plan(4)
    const headers = new Headers()

    const name = 'undici'
    const value1 = 'fetch1'
    const value2 = 'fetch2'
    t.notThrow(() => headers.set(name, value1))
    t.strictEqual(headers.get(name), value1)
    t.notThrow(() => headers.set(name, value2))
    t.strictEqual(headers.get(name), value2)
  })

  t.test('throws on invalid entry', t => {
    t.plan(3)
    const headers = new Headers()

    t.throw(() => headers.set(), 'throws on missing name and value')
    t.throw(() => headers.set('undici'), 'throws on missing value')
    t.throw(() => headers.set('invalid @ header ? name', 'valid value'), 'throws on invalid name')
  })
})

tap.test('Headers [Symbol.iterator]', t => {
  t.plan(3)
  const init = {
    'abc': '123',
    'def': '456',
    'ghi': '789'
  }
  const headers = new Headers(init)
  for (const [ name, value ] of headers) {
    t.strictDeepEqual(value, [ init[name] ])
  }
})
