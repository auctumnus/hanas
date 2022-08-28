import { HanasClient } from '../client'
import { AuthErrors, BadRequestError } from '../error-types'
import { err, HanasError, isOk } from '../fetch-wrapper'
import { Lang, LangResponseData } from '../models'

type CreateLangDto = Omit<LangResponseData, 'created' | 'updated'>
type UpdateLangDto = Partial<CreateLangDto>
type LangCodeExists = {
  status: 400
  message: 'A lang with that code already exists.'
}

type LangNotFound = {
  status: 404
  message: 'No language was found by that code.'
}

export const lang = (client: HanasClient) => ({
  /**
   * Lists all languages.
   * @returns Paginated response of all langs.
   */
  all() {
    return client
      .paginatedFetch<LangResponseData, never>('/langs')
      .then((v) => ({ ...v, data: v.data.map((d) => new Lang(client, d)) }))
  },

  /**
   * Creates a new language.
   * @param data Object with information
   * @returns The data for the created language.
   */
  create(data: CreateLangDto) {
    return client
      .fetch<LangResponseData, LangCodeExists | BadRequestError>('/langs', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      .then((d) =>
        isOk(d)
          ? new Lang(client, d.data)
          : err<LangCodeExists | BadRequestError>(d)
      )
  },

  /**
   * Gets a specific language by code.
   * @param code The lang code to retrieve.
   * @returns Information for the language.
   */
  get(code: string) {
    return client
      .fetch<LangResponseData, LangNotFound>(`/langs/${code}`)
      .then((d) => (isOk(d) ? new Lang(client, d.data) : err<LangNotFound>(d)))
  },

  /**
   * Update a language.
   * @param code The code of the language to update.
   * @param data Data to update the language with.
   * @returns The updated language.
   */
  update(code: string, data: UpdateLangDto) {
    return client
      .fetch<
        LangResponseData,
        | BadRequestError
        | AuthErrors
        | {
            status: 403
            message: 'You do not have permission to make this edit.'
          }
      >(`/langs/${code}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      .then((d) =>
        isOk(d)
          ? new Lang(client, d.data)
          : err<
              | BadRequestError
              | AuthErrors
              | {
                  status: 403
                  message: 'You do not have permission to make this edit.'
                }
            >(d)
      )
  },

  /**
   * Delete a language.
   * @param code The code of the language to delete.
   */
  delete(code: string) {
    return client.fetch<never, AuthErrors>(`/langs/${code}`, {
      method: 'DELETE',
    })
  },
})
