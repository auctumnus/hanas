export type Scalars = 'string' | 'number' | 'boolean'

export interface ModelProperty {
  name: string
  type: string
  optional: boolean
  description?: string
  properties: Record<string, Property>
}

export interface StringProperty {
  name: string
  type: 'string'
  optional: boolean
  description?: string
  maxLength?: number
  minLength?: number
  format?: string
  regex?: string
  example?: string
}

export interface NumericProperty {
  name: string
  type: 'number'
  optional: boolean
  description?: string
  max?: number
  min?: number
  example?: number
}

export interface BooleanProperty {
  name: string
  type: 'boolean'
  optional: boolean
  description?: string
  example?: boolean
}

export interface IncludeProperty {
  name: string
  type: Exclude<string, 'string' | 'boolean' | 'number'>
  optional: boolean
  description?: string
  includes: string[]
}

export type Property =
  | StringProperty
  | NumericProperty
  | BooleanProperty
  | IncludeProperty
  | ModelProperty

export interface Model {
  name: string
  properties: Record<string, Property>
}

export interface ModelParseError {
  error: true
  name: string
  inProperty?: string
  details: string
}
