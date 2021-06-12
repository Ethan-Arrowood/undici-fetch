import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

export function getHeaderClass (module, headersExport = 'Headers') {
  if (module === 'undici-fetch') module = '../../index.js'
  const lib = require(module)

  if (!Object.hasOwnProperty.call(lib, headersExport)) {
    throw new Error(`Module ${module} is missing named export ${headersExport}`)
  }

  return lib[headersExport]
}

/** Sorted list of common header keys */
export const commonHeaderKeys = [
  'A-IM',
  'Accept',
  'Accept-Charset',
  'Accept-Datetime',
  'Accept-Encoding',
  'Accept-Language',
  'Accept-Patch',
  'Accept-Ranges',
  'Access-Control-Request-Headers',
  'Access-Control-Request-Method',
  'Age',
  'Allow',
  'Alt-Svc',
  'Authorization',
  'Cache-Control',
  'Connection',
  'Content-Disposition',
  'Content-Encoding',
  'Content-Language',
  'Content-Length',
  'Content-Location',
  'Content-Range',
  'Content-Type',
  'Cookie',
  'Date',
  'Delta-Base',
  'ETag',
  'Expect',
  'Expires',
  'Forwarded',
  'From',
  'Host',
  'IM',
  'If-Match',
  'If-Modified-Since',
  'If-None-Match',
  'If-Range',
  'If-Unmodified-Since',
  'Last-Modified',
  'Link',
  'Location',
  'Max-Forwards',
  'Origin',
  'Pragma',
  'Proxy-Authenticate',
  'Proxy-Authorization',
  'Public-Key-Pins',
  'Range',
  'Referer',
  'Retry-After',
  'Server',
  'Set-Cookie',
  'Strict-Transport-Security',
  'TE',
  'Tk',
  'Trailer',
  'Transfer-Encoding',
  'Upgrade',
  'User-Agent',
  'Vary',
  'Via',
  'WWW-Authenticate',
  'Warning'
]
