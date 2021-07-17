export * from './unauthorized.exception'
export * from './notfound.exception'
export * from './unimplemented.exception'
export * from './hanas.exception'
export const serializationError = (data: any) => {
  console.error(data)
  throw new TypeError('Encountered an error serializing an object! Object is above.')
}

