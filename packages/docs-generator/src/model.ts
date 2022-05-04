import { kdljs } from 'kdljs'
import { linkIncludes } from './link'
import { warn } from './log'
import {
  ModelProperty,
  StringProperty,
  NumericProperty,
  Model,
  ModelParseError,
  IncludeProperty,
  Scalars,
  Property,
} from './types'

const FORMATS = ['uri', 'datetime']

const parseType = (s: string) => {
  const optional = s.endsWith('?')
  const type = optional ? s.substring(0, s.length - 1) : s
  return { type, optional }
}

const capFirst = (s: string) => s[0]?.toUpperCase() + s.substring(1)

const propertyIsTypeOrUndefined = (
  input: kdljs.Node,
  property: string,
  type: string,
  errors: string[]
) => {
  const value = input.properties[property]
  if (value === undefined || typeof value === type) {
    return value
  } else {
    errors.push(`${capFirst(property)} must be ${type} or not present`)
    return undefined
  }
}

const propertyIsStringOrUndefined = (
  input: kdljs.Node,
  property: string,
  errors: string[]
) => propertyIsTypeOrUndefined(input, property, 'string', errors)

const propertyIsNumberOrUndefined = (
  input: kdljs.Node,
  property: string,
  errors: string[]
) => propertyIsTypeOrUndefined(input, property, 'number', errors)

interface CommonPropertyStuff {
  name: string
  type: string
  optional: boolean
  description?: string
  example?: string | number | boolean
}

const parseNumericProperty = (
  input: kdljs.Node,
  errors: string[],
  common: CommonPropertyStuff
) => {
  const { name, type, optional, description, example } = common
  const max = propertyIsNumberOrUndefined(input, 'max', errors)
  const min = propertyIsNumberOrUndefined(input, 'min', errors)

  if (
    typeof max === 'number' &&
    typeof min === 'number' &&
    typeof example === 'number'
  ) {
    if (example > max || example < min) {
      errors.push(
        `Example should be within min/max range (${min} < n < ${max}, is ${example})`
      )
    }
  }

  if (errors.length) {
    return { name, errors }
  } else {
    return {
      name,
      type,
      optional,
      description,
      example,
      max,
      min,
    } as NumericProperty
  }
}

const parseStringProperty = (
  input: kdljs.Node,
  errors: string[],
  common: CommonPropertyStuff
) => {
  const { name, type, optional, description, example } = common
  const regex = propertyIsStringOrUndefined(input, 'regex', errors)
  if (regex && typeof example === 'string') {
    try {
      const exampleMatches = example.match(RegExp(regex as string))
      if (!exampleMatches) {
        errors.push(`Example should pass regex`)
      }
    } catch (e) {
      if (e instanceof Error) {
        errors.push(`Regex must be a valid regex; got error "${e.message}"`)
      }
    }
  }

  const format = propertyIsStringOrUndefined(input, 'format', errors)
  if (format && !FORMATS.includes(format as string)) {
    errors.push(
      `Format ${format} is not recognized - needs to be one of "${FORMATS.join(
        '", "'
      )}"`
    )
  }

  const maxLength = propertyIsNumberOrUndefined(input, 'maxLength', errors)
  const minLength = propertyIsNumberOrUndefined(input, 'minLength', errors)

  if (maxLength && minLength && example && typeof example === 'string') {
    if (example.length < minLength || example.length > maxLength) {
      errors.push(
        `Example should fit between min and max length (${minLength} < n < ${maxLength}, but is ${example.length})`
      )
    }
  }

  if (errors.length) {
    return { name, errors }
  } else {
    return {
      name,
      type,
      optional,
      description,
      example,
      regex,
      format,
      maxLength,
      minLength,
    } as StringProperty
  }
}

const isValidExample = (
  propertyType: Scalars | string,
  example: string | number | boolean
) => typeof propertyType === typeof example || example === undefined

const n2u = <T>(i: T | null) => (i === null ? undefined : i)

export const parseProperty = (
  input: kdljs.Node
): Property | { name: string; errors: (string | ModelParseError)[] } => {
  const name = input.name

  if (name === 'include') {
    warn(
      'Found an "include" node. The correct spelling is "includes" if you\'re trying to include a model!'
    )
  }

  if (name === 'includes') {
    if (!input.values.length) {
      return {
        name,
        errors: ['No values given in includes clause'],
      }
    }
    if (input.values.some((v) => typeof v !== 'string')) {
      return {
        name,
        errors: ['Includes clause must only have string values'],
      }
    }
    return {
      type: 'includes',
      name,
      includes: input.values,
    } as IncludeProperty
  }

  const errors: string[] = []
  if (!('type' in input.properties)) {
    errors.push('No type given')
  } else if (typeof input.properties.type !== 'string') {
    errors.push('Type needs to be a string')
  }
  const { type, optional } = parseType(
    typeof input.properties.type === 'string' ? input.properties.type : ''
  )

  const example = input.properties.example || ''
  const description = input.properties.description || ''

  if (description && typeof description !== 'string') {
    errors.push('Description must be either string or not present')
  }

  if (!isValidExample(type, n2u(example)!)) {
    errors.push(
      'Example must match type of property' + type
        ? ` (${type})`
        : '' + ' or not be present'
    )
  }

  // this is ugly but it works
  // #cowboycoding
  // in my case is it #cowgirlcoding?
  // ... death to the porn industry for ruining "cowgirl"
  const common = {
    name,
    type,
    optional,
    description: description
      ? description
          .toString()
          .split('\n')
          .map((s) => s.trim())
          .join('\n')
      : undefined,
    example: typeof example === type ? example : undefined,
  }

  if (input.children.length) {
    const { properties, errors } = parsePropertiesFromModel(input, name)
    if (errors.length) {
      return { name, errors }
    } else {
      return { name, type, optional, properties: arrayToObj(properties) }
    }
  }

  if (type === 'boolean') {
    if (errors.length) return { name, errors }
    // appeasing the compiler
    return {
      ...common,
      type: 'boolean',
      example: !!example,
    }
  } else if (type === 'number') {
    return parseNumericProperty(input, errors, n2u(common)!)
  } else {
    return parseStringProperty(input, errors, n2u(common)!)
  }
}

export const parsePropertiesFromModel = (
  input: kdljs.Node,
  name: string
): { errors: ModelParseError[]; properties: Property[] } => {
  // Parse properties from node
  const { properties, errors } = input.children.map(parseProperty).reduce(
    ({ properties, errors }, property) => {
      if ('errors' in property) {
        property.errors.forEach((details: string | ModelParseError) =>
          typeof details === 'string'
            ? errors.push({
                error: true,
                name,
                inProperty: (property as { name: string; errors: string[] })
                  .name,
                details,
              })
            : errors.push(details)
        )
      } else {
        properties.push(property)
      }
      return { properties, errors }
    },
    { properties: [] as Property[], errors: [] as ModelParseError[] }
  )

  // Check for duplicates
  properties.reduce((propertyNames, property) => {
    if (propertyNames.includes(property.name)) {
      errors.push({
        error: true,
        name,
        inProperty: property.name,
        details: `A property by the name ${property.name} is already defined!`,
      })
    }
    propertyNames.push(property.name)
    return propertyNames
  }, [] as string[])
  return { properties, errors }
}

export const arrayToObj = <T extends { name: string }>(arr: T[]) =>
  Object.fromEntries(arr.map((o) => [o.name, o]))

const parseModel = (input: kdljs.Node) => {
  // Ensure node is given a value
  const name = input.values[0]
  if (!name || typeof name !== 'string') {
    return [
      {
        error: true,
        name: '(no name)',
        details: 'Invalid name given.',
      },
    ] as ModelParseError[]
  }

  const { properties, errors } = parsePropertiesFromModel(input, name)

  if (errors.length) {
    return errors
  }

  return {
    name,
    properties: arrayToObj(properties),
  } as Model
}

export const parseModelsFromDocument = (document: kdljs.Document) => {
  const { models, errors } = document
    .filter((node) => node.name === 'model')
    .reduce(
      ({ models, errors }, node) => {
        const parsedModel = parseModel(node)
        if (Array.isArray(parsedModel)) {
          errors = [...errors, ...parsedModel]
        } else {
          // parseModel either returns an array of errors or a model.
          // This is a safe call that Typescript hates.
          // @ts-ignore
          models.push(parsedModel)
        }
        return { models, errors }
      },
      { models: [] as Model[], errors: [] as ModelParseError[] }
    )

  // Warn about duplicate model names
  models.reduce((modelNames, model) => {
    if (modelNames.includes(model.name)) {
      errors.push({
        error: true,
        name: model.name,
        details: `A model by the name ${model.name} is already defined!`,
      })
    }
    modelNames.push(model.name)
    return modelNames
  }, [] as string[])

  const m = arrayToObj(models)

  linkIncludes(m)

  return {
    models: m,
    errors,
  }
}
