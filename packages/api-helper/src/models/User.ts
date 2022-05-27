import { HanasClient } from '../client'
import { HanasError, PaginationArgs } from '../fetch-wrapper'
import { Lang, LangResponseData } from './Lang'

export interface UserResponseData {
  username: string
  displayName?: string
  description?: string
  gender?: string
  pronouns?: string
  profilePicture?: string
  banner?: string
  created: string
  updated: string
}

type NoLangsByUser = {
  status: 404
  message: 'No language was found by that username.'
}

export class User {
  /**
   * The username for this user.
   *
   * Follows the regex /^([a-z0-9](-|_)?)+[a-z0-9]/
   *
   * min length 30, max length 2
   */
  username: string
  /**
   * The display name for this user.
   *
   * If you're displaying users, you should use this rather than the
   * username, if it's available.
   *
   * Be wary of weird display names. You should fully expect people to use all
   * sorts of unicode hell here.
   *
   * The min/max length given here is after cleaning.
   *
   * min length 30, max length 2
   */
  displayName?: string
  /**
   * A short description of the user.
   *
   * max length 1000
   */
  description?: string
  /**
   * Hex color representing the gender of the user.
   *
   * Please don't ruin the fun by just giving users a pink/blue selector. It's
   * way funnier if you just give them a free color selection thing.
   *
   * Follows the regex /^([a-fA-F0-9]{3}){1,2}$/
   */
  gender?: string
  /**
   * A free text field, intended to store pronouns in the format of
   * nominative/accusative or nominative/accusative/possessive. In reality it's a
   * short free text field since I can't predict everything users might have.
   *
   * The length may end up being raised, but it should generally only be large
   * enough for something like "she/they/it" or whatever.
   *
   * The min/max length given here is after cleaning.
   *
   * min length 15, max length 2
   */
  pronouns?: string
  /**
   * Link to profile picture. Currently unused.
   */
  profilePicture?: string
  /**
   * Link to birdsite-esque profile picture. Currently unused.
   */
  banner?: string
  /**
   * When this user was created.
   */
  created: Date
  /**
   * When this user was last updated.
   */
  updated: Date

  langs(
    client: HanasClient,
    paginationArgs: PaginationArgs = {},
    owner: boolean = false
  ) {
    return client
      .paginatedFetch<LangResponseData, NoLangsByUser>(
        `/users/${this.username}/langs`,
        {
          params: { owner: owner + '' },
          ...paginationArgs,
        }
      )
      .then((v) => ({
        ...v,
        data: v.data.map((d) => new Lang(d)),
      }))
  }

  constructor(d: UserResponseData) {
    this.username = d.username
    this.displayName = d.displayName
    this.description = d.description
    this.gender = d.gender
    this.pronouns = d.pronouns
    this.profilePicture = d.profilePicture
    this.banner = d.banner
    this.created = new Date(d.created)
    this.updated = new Date(d.updated)
  }
}
