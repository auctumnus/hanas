import { acceptHMRUpdate, defineStore } from 'pinia'
import { User } from '@hanas-app/api-helper'

export const useUserStore = defineStore('user', {
  state: () => ({} as User | {}),
  actions: {
    replaceUser(user: User | null) {
      this.$state = user ? user : {}
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
