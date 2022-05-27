import { HanasClient } from '../client'
import { AuthErrors, BadRequestError } from '../error-types'
import { User, UserResponseData } from '../models'

type UpdateUserDto = Partial<
  Omit<User, 'created' | 'updated' | 'profilePicture' | 'banner'>
>

export const user = (client: HanasClient) => ({
  /**
   * Lists all users.
   * @returns Paginated response of all users.
   */
  all() {
    return client
      .paginatedFetch<UserResponseData, never>('/users')
      .then((v) => ({ ...v, data: v.data.map((d) => new User(client, d)) }))
  },

  /**
   * Gets a specific user by their username.
   * @param username The username of the user to get the information for.
   * @returns The data of the user.
   */
  get(username: string) {
    return client
      .fetch<
        UserResponseData,
        { status: 404; message: 'No user was found with that username.' }
      >(`/users/${username}`)
      .then((d) => new User(client, d))
  },

  /**
   * Updates a user. You must be logged in as this user to update them.
   * @param username The username of the user to update.
   * @param data The data to update this user with.
   * @returns The updated user.
   */
  update(username: string, data: UpdateUserDto) {
    return client
      .fetch<UserResponseData, BadRequestError | AuthErrors>(
        `/users/${username}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      )
      .then((d) => new User(client, d))
  },

  /**
   * Deletes a user. You must be logged in as this user to delete them.
   * @param username The username of the user to delete.
   */
  async delete(username: string) {
    await client.fetch(`/users/${username}`, { method: 'DELETE' })
  },
})
