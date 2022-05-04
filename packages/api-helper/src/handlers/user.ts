import { HanasClient } from '../client'
import { AuthMessages, AuthStatuses, BadRequestMessage } from '../error-types'
import { paginated, w } from '../fetch-wrapper'
import { User } from '../models'

type UpdateUserDto = Partial<
  Omit<User, 'created' | 'updated' | 'profilePicture' | 'banner'>
>

export const user = (client: HanasClient) => ({
  /**
   * Lists all users.
   * @returns Paginated response of all users.
   */
  all() {
    return paginated(client)<User, never, never>('/users')
  },

  /**
   * Gets a specific user by their username.
   * @param username The username of the user to get the information for.
   * @returns The data of the user.
   */
  get(username: string) {
    return w<User, 404, 'No user was found with that username.'>(
      `/user/${username}`
    )
  },

  /**
   * Updates a user. You must be logged in as this user to update them.
   * @param username The username of the user to update.
   * @param data The data to update this user with.
   * @returns The updated user.
   */
  update(username: string, data: UpdateUserDto) {
    return w<User, 400 | AuthStatuses, BadRequestMessage | AuthMessages>(
      `/user/${username}`,
      { body: JSON.stringify(data) }
    )
  },

  /**
   * Deletes a user. You must be logged in as this user to update them.
   * @param username The username of the user to update.
   * @returns Nothing.
   */
  delete(username: string) {
    return w<'', 401 | 403>(`/user/${username}`)
  },
})
