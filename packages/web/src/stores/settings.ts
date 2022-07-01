import { acceptHMRUpdate, defineStore } from 'pinia'
import { useColorMode, useStorage } from '@vueuse/core'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    themeIsAuto: true,
    theme: useColorMode(),
    language: useStorage('hanas-language', 'system'),
  }),
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
