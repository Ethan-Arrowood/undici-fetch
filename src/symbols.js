const kBody = Symbol('body')
const kBodyUsed = Symbol('bodyUsed')

const kHeadersList = Symbol('headersList')

const kHeaders = Symbol('headers')
const kStatus = Symbol('status')
const kStatusText = Symbol('statusText')
const kType = Symbol('type')
const kUrlList = Symbol('urlList')

module.exports = {
  body: {
    kBody,
    kBodyUsed
  },
  headers: {
    kHeadersList
  },
  response: {
    kHeaders,
    kStatus,
    kStatusText,
    kType,
    kUrlList
  }
}
