import { acceptHMRUpdate, defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { toRefs } from '@vueuse/core'
import { User } from '@hanas-app/api-helper'

export const useUserStore = defineStore('user', () =>
  toRefs(
    ref({
      user: null as User | null,
    })
  )
)

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
