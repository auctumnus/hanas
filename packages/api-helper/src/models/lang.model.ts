import {validate} from '../validation'
import { PartialUser } from './user.model'
import { and, obj, arr, str, date } from 'eiki'


/**
 * Represents a language, without relations resolved. Usually found in relations
 * to other entities.
 */
export class PartialLang {
  /**
   * The ID of the language. Must be from 3-5 characters, and lowercase [a-z].
   * @example exa
   */
  id: string

  /**
   * The name of the language.
   * @example Examplish
   */
  name: string

  /**
   * A short description of the language - compare the first few paragraphs of
   * a Wikipedia article.
   * @example This is a very cool example language! You should read more about it.
   */
  description: string

  /**
   * A link to the image for the flag of the language. By default, the image is
   * 800 pixels square at maximum, but can be any size or aspect ratio. If
   * the flag is bigger than that, it'll crop it using sharp's cover fit resize -
   * which, if the docs are to be believed, should be equivalent to the CSS
   * `object-fit: cover; object-position: center;`
   * @example https://my-bucket.s3.us-west-2.amazonaws.com/0UfVPsLpvMaaJMg11o8GR
   */
  flag: string

  /**
   * The timestamp when the language was created.
   * @example 2021-05-23T01:06:53.812Z
   */
  created: Date

  /**
   * The timestamp when the language was last updated - this does not
   * include addition of words.
   * @example 2021-05-23T01:09:47.236Z
   */
  updated: Date

  static schema = obj({
    id: str,
    name: str,
    description: str,
    flag: str,
    created: date,
    updated: date
  })
  /**
   * Creates a new PartialLang; if you're consuming the API helper, you should
   * not use this.
   * @package
   * @param data The data to initialize this PartialLang with.
   * @returns A new PartialLang.
   */
  constructor(data: any) {
    // validate
    validate(PartialLang, data)
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.flag = data.flag
    this.created = new Date(data.created)
    this.updated = new Date(data.updated)
  }
}

/**
 * Represents a language.
 */
export class Lang extends PartialLang {
  /**
   * The user who owns the language.
   */
  owner: PartialUser

  /**
   * Any other users who are able to contribute to the language.
   */
  contributors: PartialUser[]

  static schema = and(PartialLang.schema, obj({
    owner: PartialUser.schema,
    contibutors: arr(PartialUser.schema)
  }))

  /**
   * Creates a new language entity; if you're consuming the API helper, you should
   * not use this.
   * @package
   * @param data The data to initialize this language with.
   * @returns A new language.
   */
  constructor(data: any) {
    super(data)
    
    this.owner = data.owner
    this.contributors = data.contributors
  }
}
