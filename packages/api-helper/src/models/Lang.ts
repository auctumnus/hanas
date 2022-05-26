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

  constructor(d: LangResponseData) {
    this.code = d.code
    this.name = d.name
    this.description = d.description
    this.updated = new Date(d.updated)
    this.created = new Date(d.created)
  }
}
