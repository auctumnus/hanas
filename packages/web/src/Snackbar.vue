<script lang="ts">
import { defineComponent } from 'vue'
export interface SnackbarNotification {
  text: string
  actionText?: string
  action?: () => any
  persist?: boolean
  duration?: number
}

let notificationIsProcessing = false
let onNewNotification: () => any

const pendingNotifications: SnackbarNotification[] = []

export const sendNotification = (notification: SnackbarNotification) => {
  if (notification.duration && notification.duration < 4000) {
    console.warn('notification has a duration of less than 4 seconds')
  } else if (notification.duration && notification.duration > 10000) {
    console.warn('notification has a duration of more than 4 seconds')
  } else if (!notification.persist && !notification.duration) {
    console.warn(
      'auto-dismissing notification without duration; setting to 4 seconds'
    )
    notification.duration = 4000
  }
  pendingNotifications.push(notification)
  if (!notificationIsProcessing) {
    onNewNotification()
  }
}

export default defineComponent({
  name: 'Snackbar',
})
</script>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { get, set } from '@vueuse/core'

const TIME_BETWEEN_NOTIFICATIONS = 300

const isOpen = ref(false)
const current: Ref<SnackbarNotification> = ref({ text: '', duration: 1 })

let timeout: ReturnType<typeof setTimeout>

const showNext = () => {
  const notification = pendingNotifications.shift()
  if (!notification) {
    notificationIsProcessing = false
    return
  }

  notificationIsProcessing = true
  set(isOpen, true)
  set(current, notification)

  const { persist, duration } = notification
  if (!persist) {
    timeout = setTimeout(() => {
      set(isOpen, false)
      setTimeout(showNext, TIME_BETWEEN_NOTIFICATIONS)
    }, duration)
  }
}

onNewNotification = showNext

const close_ = () => {
  clearTimeout(timeout)
  set(isOpen, false)

  setTimeout(showNext, TIME_BETWEEN_NOTIFICATIONS)
}

const action = () => {
  close_()
  get(current).action?.()
}
</script>

<template>
  <div class="snackbar-container">
    <Transition name="snackbar">
      <div role="status" v-if="isOpen" class="snackbar">
        <span>{{ current.text }}</span>
        <HButton
          kind="text"
          v-if="current.actionText"
          :content="current.actionText"
          @click="action"
        />
        <button class="px-3 flex flex-row items-center" @click="close_">
          <mdi-close class="h-6 w-6" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.snackbar-container {
  @apply absolute bottom-2
  w-screen
  flex flex-row justify-center items-center;
}
.snackbar {
  @apply h-12 pl-4
 flex flex-row items-center
 bg-inverse-surface-light dark:bg-inverse-surface-dark
 text-inverse-on-surface-light dark:text-inverse-on-surface-dark
 rounded-sm
 text-sm;
}
.snackbar-enter-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.snackbar-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
}

.snackbar-enter-from {
  opacity: 0;
  transform: translateY(200%);
}
.snackbar-leave-to {
  opacity: 0;
}
</style>
