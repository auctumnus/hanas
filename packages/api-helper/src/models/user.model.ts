import { PartialLang } from './lang.model'
import { UnimplementedException } from '../errors'
import { validate } from '../validation'
import { and, obj, arr, str, date } from 'eiki'

/**
 * Represents a user, without relations resolved. Usually found in relations
 * to other entities.
 */
export class PartialUser {
  /**
   * The username of the user, which is the primary key for finding them.
   * @example alice
   */
  username: string

  /**
   * The name that the user would prefer to be displayed. Can contain anything,
   * although it is .trim()ed. OpenAPI just does not seem to enjoy a space
   * here, for some reason?
   * @example AliceSmith
   */
  display_name: string

  /**
   * A link to the image for the profile picture of this user. By default, the
   * image is 400 pixels square at maximum, but can be any aspect ratio or size
   * within that. If the profile picture is bigger than that, it'll crop it using
   * sharp's cover fit resize, which, if the docs are to be believed, should
   * be equivalent to the CSS `object-fit: cover; object-position: center;`
   * @example https://my-bucket.s3.us-west-2.amazonaws.com/YhEcI1URMGimpoyAav9Zp
   */
  profile_picture: string

  /**
   * A link to the image for the banner of this user. See the profile_picture
   * attribute for more info on resizing - the maximum size by default is 500px
   * high by 1500px wide.
   * @example https://my-bucket.s3.us-west-2.amazonaws.com/2F-oOC5ejzZuCZdp01OWS
   */
  banner: string

  /**
   * The timestamp for when the user was created.
   * @example 2021-05-31T03:07:58.146Z
   */
  created: Date

  /**
   * The timestamp for when the user's information was last updated.
   * @example 2021-05-31T03:08:29.751Z
   */
  updated: Date

  /**
   * Eiki schema for this entity.
   */
  static schema = obj({
      username: str,
      display_name: str,
      profile_picture: str,
      banner: str,
      created: date,
      updated: date
    })

  /**
   * Creates a new PartialUser. If you're consuming the helper, you shouldn't
   * use this.
   * @package
   * @param data The data to initialize the PartialUser with.
   * @returns A new PartialUser.
   */
  constructor (data: any) {
    validate(PartialUser, data)
    this.username = data.username
    this.display_name = data.display_name
    this.profile_picture = data.profile_picture
    this.banner = data.banner
    this.updated = new Date(data.updated)
    this.created = new Date(data.created)
  }

  /**
   * Resolves this PartialUser into a User.
   * @returns The User entity for this user.
   */
  resolve() {
    throw new UnimplementedException()
  }
}

/**
 * Represents a user.
 */
export class User extends PartialUser {
  /**
   * The languages which this user owns.
   */
  ownedLangs: PartialLang[]

  /**
   * The languages which this user is able to contribute to.
   */
  contributedLangs: PartialLang[]

  static schema = and(PartialUser.schema, obj({
    ownedLangs: arr(PartialLang.schema),
    contributedLangs: arr(PartialLang.schema)
  }))

  /**
   * Creates a new user entity; if you're consuming the API helper, you should
   * not use this.
   * @package
   * @param data The data to initialize this user with.
   * @returns A new user.
   */
  constructor(data: User) {
    super(data)
    validate(User, data)
    this.ownedLangs = data.ownedLangs
    this.contributedLangs = data.contributedLangs
  }
}
