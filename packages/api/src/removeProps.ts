export function removeProps<T extends unknown>(obj: T, toRemove: string[]) {
  toRemove.forEach((propName) => {
    delete obj[propName]
  })
  return obj
}
