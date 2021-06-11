import Undici from 'undici'

declare const fetch: {
  (
    resource: string | Request,
    init?: RequestInit
  ): Promise<Response>
  Request: Request
  Response: Response
  Headers: Headers
  Body: Body
  internals: Internals
  setGlobalDispatcher: typeof Undici.setGlobalDispatcher
  getGlobalDispatcher: typeof Undici.getGlobalDispatcher
}

declare class ControlledAsyncIterable<Data> implements AsyncIterable<Data> {
  data: AsyncIterable<Data>
  disturbed: boolean
  [Symbol.asyncIterator](): AsyncIterator<Data>
}

type BodyInput<Data = unknown> = AsyncIterable<Data> | Iterable<Data> | null | undefined

declare class Body<Data = unknown> {
  constructor (input?: BodyInput<Data>);

  readonly body: ControlledAsyncIterable<Data> | null
  readonly bodyUsed: boolean

  arrayBuffer (): Promise<Buffer>;
  blob (): never;
  formData (): never;
  json (): Promise<any>;
  text (): Promise<string>;
}

type HeadersInit = Headers | Iterable<[string, string]> | string[] | Record<string, string> | undefined

declare class Headers implements Iterable<[string, string]> {
  constructor (init?: HeadersInit);
  append (name: string, value: string): void;
  delete (name: string): void;
  get (name: string): string | null;
  has (name: string): boolean;
  set (name: string, value: string): void;
  entries (): IterableIterator<[string, string]>;
  forEach (
    callbackfn: (value: string, key: string, iterable: Headers) => void,
    thisArg?: any
  ): void;
  keys (): IterableIterator<string>;
  values (): IterableIterator<string>;
  [Symbol.iterator] (): Iterator<[string, string]>;
}

interface RequestInit {
  method?: string
  keepalive?: boolean
  headers?: Headers | HeadersInit
  body?: BodyInput
  redirect?: string
  integrity?: string
  signal?: AbortSignal
}

declare class Request extends Body {
  constructor (input: Request | string, init?: RequestInit);

  readonly url: URL
  readonly method: string
  readonly headers: Headers
  readonly redirect: string
  readonly integrity: string
  readonly keepalive: boolean
  readonly signal: AbortSignal

  clone (): Request;
}

interface ResponseInit {
  status?: number
  statusText?: string
  headers?: Headers | HeadersInit
}

declare class Response extends Body {
  constructor (body: BodyInput, init?: ResponseInit)

  readonly headers: Headers
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly type: string

  clone (): Response;

  static error (): Response;
  static redirect (url: string, status: number): Response;
}

interface Internals {
  symbols: {
    body: {
      kBody: Symbol,
      kBodyUser: Symbol
    },
    headers: {
      kHeadersList: Symbol
    },
    response: {
      kStatus: Symbol,
      kStatusText: Symbol,
      kType: Symbol
    },
    request: {
      kMethod: Symbol,
      kRedirect: Symbol,
      kIntegrity: Symbol,
      kKeepalive: Symbol,
      kSignal: Symbol
    },
    shared: {
      kHeaders: Symbol,
      kUrlList: Symbol
    }
  }
}

export default fetch
export { setGlobalDispatcher, getGlobalDispatcher } from 'undici'
export type {
  Body,
  Headers,
  Request,
  Response
}
