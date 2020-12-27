// from https://github.com/Gozala/querystring

function stringifyPrimitive (v: any): string {
  switch (typeof v) {
    case 'string':
      return v

    case 'boolean':
      return v ? 'true' : 'false'

    case 'number':
      return isFinite(v) ? v.toString() : ''

    default:
      return ''
  }
}

export function buildQueryString(obj: any, sep?: string, eq?: string, name?: string) {
  sep = sep || '&'
  eq = eq || '='
  if (obj === null) {
    obj = undefined
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map((k) => {
      const ks = encodeURIComponent(stringifyPrimitive(k)) + eq
      if (Array.isArray(obj[k])) {
        return obj[k].map((v: any) => {
          return ks + encodeURIComponent(stringifyPrimitive(v))
        }).join(sep)
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]))
      }
    }).join(sep)

  }

  if (!name) return ''
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj))
}
