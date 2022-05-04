import { auth } from 'backend-shared'

export const {
  authenticated,
  deleteUser,
  getUser,
  updateUsername,
  userMiddleware,
} = auth
