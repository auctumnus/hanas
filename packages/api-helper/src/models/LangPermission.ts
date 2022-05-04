export interface LangPermission {
  /**
   * When this set of permissions was created; aka when the invite
   * for this language was accepted, or in the case of the owner, when the
   * language was created.
   */
  created: Date
  /**
   * When this set of permissions was last updated.
   */
  updated: Date
  /**
   * Whether this user owns the language.
   * Overrides all other permissions.
   */
  owner: boolean
  /**
   *
   * Whether this user can update the permissions for this language, including
   * permissions of other users or removing their permissions. They cannot edit
   * the permissions of other users with this permission, or those of the owner.
   *
   */
  changePermissions: boolean
  /**
   * Whether this user can update the ID (or code) of the language.
   */
  changeId: boolean
  /**
   * Whether this user can update the other
   * information of the language, including the name and description.
   */
  changeInfo: boolean
  /**
   * Whether this user can add/edit/remove words in this language.
   */
  changeWords: boolean
}
