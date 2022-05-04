import { acceptHMRUpdate, defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { toRefs } from '@vueuse/core'

export const useUserStore = defineStore('user', () =>
  toRefs(
    ref({
      username: 'autumn',
      displayName: 'autumn',
      description: "aspuch m' u sará kašen chi",
      gender: '76428a',
      pronouns: 'she/her',
      profilePicture: '/public/example-pfp.png',
      banner: '',
      created: new Date('2021-09-27T14:39:08.909Z'),
      updated: new Date('2021-09-27T13:29:08.183Z'),
    })
  )
)

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
