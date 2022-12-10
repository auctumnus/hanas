import { sendNotification } from './Snackbar.vue'
import type { SnackbarNotification } from './Snackbar.vue'

export const notif = (text: string) =>
  sendNotification({
    text,
    duration: 4000,
  })

export { sendNotification }
export type { SnackbarNotification }
