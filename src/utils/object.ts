/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
type OAny = { [k: string]: any }
export function shallowEqual(objA: OAny, objB: OAny): boolean {
  if (Object.is(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !Object.is(objA[keysA[i]], objB[keysA[i]])
    ) {
      return false
    }
  }

  return true
}

export function getAtPath(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc: any, x) => acc && acc[x], obj)
}

export function setAtPath(obj: any, path: any, value: any): void {
  if (typeof path === 'string') {
    path = path.split('.')
  }

  if (path.length > 1) {
    const p = path.shift()
    if (obj[p] === null || typeof obj[p] !== 'object') {
      obj[p] = {}
    }
    setAtPath(obj[p], path, value)
  } else {
    obj[path[0]] = value
  }
}

export function pick<T, K extends keyof T>(obj: T, props: K[]): Pick<T, K> {
  return {
    ...props.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {})
  } as Pick<T, K>
}
