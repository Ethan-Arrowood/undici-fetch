// Body
const kBody = Symbol('body')
const kBodyUsed = Symbol('bodyUsed')

// Headers
const kHeadersList = Symbol('headersList')

// Request & Response
const kHeaders = Symbol('headers')
const kUrlList = Symbol('urlList')

// Response
const kStatus = Symbol('status')
const kStatusText = Symbol('statusText')
const kType = Symbol('type')

// Request
const kMethod = Symbol('method')
const kRedirect = Symbol('redirect')
const kIntegrity = Symbol('integrity')
const kKeepalive = Symbol('keepalive')
const kSignal = Symbol('signal')

module.exports = {
  body: {
    kBody,
    kBodyUsed
  },
  headers: {
    kHeadersList
  },
  response: {
    kStatus,
    kStatusText,
    kType
  },
  request: {
    kMethod,
    kRedirect,
    kIntegrity,
    kKeepalive,
    kSignal
  },
  shared: {
    kHeaders,
    kUrlList
  }
}
