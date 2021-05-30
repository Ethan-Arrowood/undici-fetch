'use strict'

const { Body, isUnusable, extractBody } = require('./body')
const { Headers } = require('./headers')
const {
  response: {
    kHeaders,
    kStatus,
    kStatusText,
    kType,
    kUrlList
  },
  body: {
    kBody
  }
} = require('./symbols')

class Response extends Body {
  constructor (body = null, { status = 200, statusText = '', headers } = {}) {
    if (typeof status !== 'number') {
      throw TypeError(`Response status must be of type number. Found type: ${typeof status}`)
    } else if (status < 200 || status > 599) {
      throw RangeError(`Response status must be between 200 and 599 inclusive. Found: ${status}`)
    }

    if (typeof statusText !== 'string') {
      throw TypeError(`Response statusText must be of type string. Found type: ${typeof statusText}`)
    }

    if (body !== null) {
      if (isNullBodyStatus(status)) {
        throw TypeError(`Expected non-null Response body status. Found: ${status}`)
      }

      const [extractedBody, contentType] = extractBody(body)

      super(extractedBody)

      this[kHeaders] = new Headers(headers)

      if (contentType !== null && !this[kHeaders].has('content-type')) {
        this[kHeaders].append('content-type', contentType)
      }
    } else {
      super(body)
      this[kHeaders] = new Headers(headers)
    }

    this[kStatus] = status
    this[kStatusText] = statusText

    this[kType] = 'default'

    this[kUrlList] = []
  }

  get type () {
    return this[kType]
  }

  get url () {
    const length = this[kUrlList].length
    return length === 0 ? '' : this[kUrlList][length - 1].toString()
  }

  get redirected () {
    return this[kUrlList].length > 1
  }

  get status () {
    return this[kStatus]
  }

  get ok () {
    return isOkStatus(this[kStatus])
  }

  get statusText () {
    return this[kStatusText]
  }

  get headers () {
    return this[kHeaders]
  }

  clone () {
    if (isUnusable(this[kBody])) {
      throw TypeError('Cannot clone Response - body is unusable')
    }

    const response = new Response()

    response[kHeaders] = this[kHeaders]
    response[kStatus] = this[kStatus]
    response[kStatusText] = this[kStatusText]
    response[kType] = this[kType]
    response[kUrlList] = this[kUrlList]

    if (this[kBody] !== null) {
      // todo: tee this[kBody]
      throw Error('Cannot clone a non-null body response')
    }

    return response
  }

  static error () {
    const response = new Response(null, { statusText: '' })
    // Manually override status since constructor will throw error is status is 0
    response[kStatus] = 0
    response[kType] = 'error'
    return response
  }

  static redirect (url, status) {
    const parsedURL = new URL(url)

    if (!isRedirectStatus(status)) {
      throw RangeError(`redirect status must be 301, 302, 303, 307, or 308. Found ${status}`)
    }

    const response = new Response(null, {
      headers: ['location', parsedURL.toString()],
      status
    })

    return response
  }
}

function isNullBodyStatus (status) {
  return status === 204 || status === 205 || status === 304
}

function isOkStatus (status) {
  return status >= 200 && status <= 299
}

function isRedirectStatus (status) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308
}

module.exports = {
  Response
}
