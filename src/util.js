export function isStream (body) {
  return !!(body && typeof body.on === 'function')
}