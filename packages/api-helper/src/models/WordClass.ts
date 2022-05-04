export interface WordClass {
  /**
   * A name for this word class.
   */
  name: string
  /**
   * An abbreviation for this word class, generally only a couple
   * characters long.
   */
  abbreviation: string
  /**
   * When this word class was created.
   */
  created: Date
  /**
   * When this word class was last updated.
   */
  updated: Date
}
