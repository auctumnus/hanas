import { auth } from '@hanas-app/backend-shared'

export const {
  authenticated,
  deleteUser,
  getUser,
  updateUsername,
  userMiddleware,
} = auth
