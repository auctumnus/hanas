import { HanasClient } from '../client'
import { PaginationArgs } from '../fetch-wrapper'
import { User, UserResponseData } from './User'

export interface LangResponseData {
  code: string
  name: string
  description?: string
  created: string
  updated: string
}

export class Lang {
  /**
   * Language code, primary identifier for languages.
   *
   * Follows the regex /[a-z]/
   *
   * min length 5, max length 3
   */
  code: string
  /**
   * Name of the language.
   *
   * min length 30, max length 2
   */
  name: string
  /**
   * A short description of the language.
   *
   * max length 2500
   */
  description?: string
  /**
   * When this language was created.
   */
  created: Date
  /**
   * When this language was last updated.
   */
  updated: Date

  #client: HanasClient

  /**
   * Retrieve the owner of this language.
   * @returns Information about the owner of this language.
   */
  async owner() {
    return new User(
      this.#client,
      await this.#client.fetch<UserResponseData>(`/langs/${this.code}/owner`)
    )
  }

  /**
   * Retrieve information about users who collaborate to this language -
   * that is, that have permissions to the language.
   * @param paginationArgs Arguments for the paginator.
   * @returns Paginated response of users who have collaborated to this language.
   */
  async collaborators(paginationArgs: PaginationArgs = {}) {
    return this.#client
      .paginatedFetch<UserResponseData>(
        `/langs/${this.code}/collaborators`,
        paginationArgs
      )
      .then((v) => ({
        ...v,
        data: v.data.map((d) => new User(this.#client, d)),
      }))
  }

  constructor(client: HanasClient, d: LangResponseData) {
    this.code = d.code
    this.name = d.name
    this.description = d.description
    this.updated = new Date(d.updated)
    this.created = new Date(d.created)
    this.#client = client
  }
}
