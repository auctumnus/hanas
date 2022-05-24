import { HanasClient } from '../client'
import { AuthErrors, BadRequestError } from '../error-types'
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
    //return paginated(client)<User, never, never>('/users')
  },

  /**
   * Gets a specific user by their username.
   * @param username The username of the user to get the information for.
   * @returns The data of the user.
   */
  get(username: string) {
    return client.fetch<
      User,
      { status: 404; message: 'No user was found with that username.' }
    >(`/user/${username}`)
  },

  /**
   * Updates a user. You must be logged in as this user to update them.
   * @param username The username of the user to update.
   * @param data The data to update this user with.
   * @returns The updated user.
   */
  update(username: string, data: UpdateUserDto) {
    return client.fetch<User, BadRequestError | AuthErrors>(
      `/user/${username}`,
      {
        body: JSON.stringify(data),
      }
    )
  },

  /**
   * Deletes a user. You must be logged in as this user to update them.
   * @param username The username of the user to update.
   * @returns Nothing.
   */
  delete(username: string) {
    return client.fetch<undefined>(`/user/${username}`)
  },
})
