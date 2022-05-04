import { IncludeProperty, Model } from './types'

const includeToModel =
  (models: Record<string, Model>) =>
  (property: IncludeProperty): Model['properties'] => {
    const properties = {} as Model['properties']
    property.includes.forEach((include) => {
      if (include.startsWith('!')) {
        const removedProperty = include.split('.')[1]
        delete properties[removedProperty]
      } else if (include.includes('.')) {
        const model = include.split('.')[0]
        const prop = include.split('.')[1]
        properties[prop] = Object.assign({}, models[model].properties[prop])
      } else {
        const model = include
        Object.assign(properties, models[model].properties)
      }
    })
    return properties
  }

export const linkIncludes = (models: Record<string, Model>) =>
  Object.values(models).forEach((model) =>
    Object.entries(model.properties)
      .filter(([_, p]) => 'includes' in p)
      // typescript pls
      .map(([n, p]) => [n, p as IncludeProperty] as const)
      .forEach(([propertyName, property]) => {
        const expand = includeToModel(models)
        Object.assign(model.properties, expand(property))
        delete model.properties[propertyName]
      })
  )
