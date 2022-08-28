import { HanasClient } from '../client'
import { AuthErrors, BadRequestError } from '../error-types'
import { User, UserResponseData } from '../models'
import { err, isOk } from '../fetch-wrapper'

type UpdateUserDto = Partial<
  Omit<User, 'created' | 'updated' | 'profilePicture' | 'banner'>
>

type UserNotFound = {
  status: 404
  message: 'No user was found with that username.'
}

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
      .fetch<UserResponseData, UserNotFound>('/users/' + username)
      .then((d) => (isOk(d) ? new User(client, d.data) : err<UserNotFound>(d)))
  },

  /**
   * Updates the information for your user.
   * @param data The data to update this user with.
   * @param username If you already have your current username, prevents sending
   * another request to find it.
   * @returns The updated user.
   */
  async update(data: UpdateUserDto, username?: string) {
    const u = username || (await client.currentUser())?.username
    if (!u) {
      throw new Error("Can't update your information if not logged in.")
    }
    return client
      .fetch<UserResponseData, BadRequestError | AuthErrors>('/users/' + u, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      .then((d) =>
        isOk(d)
          ? new User(client, d.data)
          : err<BadRequestError | AuthErrors>(d)
      )
  },

  /**
   * Deletes your account.
   * @param username If you already have your current username, prevents sending
   * another request to find it.
   */
  async delete(username?: string) {
    const u = username || (await client.currentUser())?.username

    await client.fetch('/users/' + u, { method: 'DELETE' })
  },

  /**
   * Update your profile picture.
   * @param username If you already have your current username, prevents sending
   * another request to find it.
   */
  async uploadProfilePicture(file: Blob, username?: string) {
    const u = username || (await client.currentUser())?.username

    const body = new FormData()
    body.append('profilePicture', file)

    console.log(file.size)

    type UploadProfilePictureError =
      | {
          status: 403
          message: "You do not have permission to edit another user's profile picture."
        }
      | { status: 400; message: 'File is above the limit of N bytes.' }
      | { status: 400; message: 'Unsupported mimetype.' }

    return await client
      .fetch<{ url: string }, UploadProfilePictureError>(
        `/users/${u}/profile-picture`,
        {
          method: 'PUT',
          body,
          headers: {
            'Content-Type': `multipart/form-data; ${file.type}`,
            'Content-Length': file.size + '',
          },
        }
      )
      .then((d) => (isOk(d) ? d.data : err<UploadProfilePictureError>(d)))
  },
  /**
   * Removes your profile picture.
   * @param username If you already have your current username, prevents sending
   * another request to find it.
   */
  async deleteProfilePicture(username?: string) {
    const u = username || (await client.currentUser())?.username

    return await client
      .fetch<
        never,
        {
          status: 403
          message: "You do not have permission to edit another user's profile picture."
        }
      >(`/users/${u}/profile-picture`, {
        method: 'DELETE',
      })
      .then((d) =>
        isOk(d)
          ? undefined
          : err<{
              status: 403
              message: "You do not have permission to edit another user's profile picture."
            }>(d)
      )
  },

  /**
   * Update your profile's banner image.
   * @param username If you already have your current username, prevents sending
   * another request to find it.
   */
  async uploadBanner(file: Blob, username?: string) {
    const u = username || (await client.currentUser())?.username

    const body = new FormData()
    body.append('banner', file)

    console.log(file.size)

    type UploadBannerError =
      | {
          status: 403
          message: "You do not have permission to edit another user's banner."
        }
      | { status: 400; message: 'File is above the limit of N bytes.' }
      | { status: 400; message: 'Unsupported mimetype.' }

    return await client
      .fetch<{ url: string }, UploadBannerError>(`/users/${u}/banner`, {
        method: 'PUT',
        body,
        headers: {
          'Content-Type': `multipart/form-data; ${file.type}`,
          'Content-Length': file.size + '',
        },
      })
      .then((d) => (isOk(d) ? d.data : err<UploadBannerError>(d)))
  },
  /**
   * Removes your profile's banner image.
   * @param username If you already have your current username, prevents sending
   * another request to find it.
   */
  async deleteBanner(username?: string) {
    const u = username || (await client.currentUser())?.username

    return await client
      .fetch<
        never,
        {
          status: 403
          message: "You do not have permission to edit another user's banner."
        }
      >(`/users/${u}/banner`, {
        method: 'DELETE',
      })
      .then((d) =>
        isOk(d)
          ? undefined
          : err<{
              status: 403
              message: "You do not have permission to edit another user's banner."
            }>(d)
      )
  },
})
