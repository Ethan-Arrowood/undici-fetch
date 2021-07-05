import Undici from 'undici'

declare const fetch: {
  (
    resource: string | Request | URL,
    init?: RequestInit
  ): Promise<Response>
  Request: Request
  Response: Response
  Headers: Headers
  Body: Body
  setGlobalDispatcher: typeof Undici.setGlobalDispatcher
  getGlobalDispatcher: typeof Undici.getGlobalDispatcher
}

declare class ControlledAsyncIterable<Data> implements AsyncIterable<Data> {
  constructor (input: AsyncIterable<Data> | Iterable<Data>)
  data: AsyncIterable<Data>
  disturbed: boolean
  [Symbol.asyncIterator] (): AsyncIterator<Data>
}

type BodyInput<Data = unknown> = AsyncIterable<Data> | Iterable<Data> | null | undefined

interface BodyMixin<Data = unknown> {
  readonly body: ControlledAsyncIterable<Data> | null
  readonly bodyUsed: boolean

  arrayBuffer: () => Promise<Buffer>
  blob: () => never
  formData: () => never
  json: () => Promise<any>
  text: () => Promise<string>
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

declare class Request<Data = unknown> implements BodyMixin {
  constructor (input: Request | string | URL, init?: RequestInit);

  readonly url: URL
  readonly method: string
  readonly headers: Headers
  readonly redirect: string
  readonly integrity: string
  readonly keepalive: boolean
  readonly signal: AbortSignal

  readonly body: ControlledAsyncIterable<Data> | null
  readonly bodyUsed: boolean

  arrayBuffer (): Promise<Buffer>;
  blob (): never;
  formData (): never;
  json (): Promise<any>;
  text (): Promise<string>;

  clone (): Request;
}

interface ResponseInit {
  status?: number
  statusText?: string
  headers?: Headers | HeadersInit
}

declare class Response<Data = unknown> implements BodyMixin {
  constructor (body: BodyInput, init?: ResponseInit)

  readonly headers: Headers
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly type: string
  readonly url: string
  readonly redirected: boolean

  readonly body: ControlledAsyncIterable<Data> | null
  readonly bodyUsed: boolean

  arrayBuffer (): Promise<Buffer>;
  blob (): never;
  formData (): never;
  json (): Promise<any>;
  text (): Promise<string>;

  clone (): Response;

  static error (): Response;
  static redirect (url: string, status: number): Response;
}

export default fetch
export { setGlobalDispatcher, getGlobalDispatcher } from 'undici'
export type {
  BodyMixin
}
export {
  Headers,
  Request,
  Response
}
