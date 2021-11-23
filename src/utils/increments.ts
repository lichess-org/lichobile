import tupleOf from './tupleOf'

export function increments(min: number, max: number, step = 1): string[] {
  const array = []
  for (let i = min; i <= max; i += step) {
    array.push(i.toString())
  }
  return array
}

export function incrementTuples(min: number, max: number, step = 1): [string, string][] {
  return increments(min, max, step).map(tupleOf)
}
