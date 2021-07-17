import { ValidationFunction } from 'eiki'
import {serializationError} from "./errors"

interface ClassWithSchema {
  new (...args: any): any
  schema: ValidationFunction
}

/**
 * Throws an error if the data doesn't match the schema for the given class.
 * See https://github.com/microsoft/TypeScript/issues/34523 for why this isn't
 * an arrow function like the rest of the codebase's functions lmao
 * @param clasz The class with schema to check the data against. (Named clasz for
 * javascript reasons.)
 * @param data The data to validate.
 */
export function validate <T extends ClassWithSchema>(clasz: T, data: any): asserts data is InstanceType<T> {
  if(!clasz.schema(data)) {
    serializationError(data)
  }
}

