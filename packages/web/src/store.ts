import { createStore, Store } from 'vuex'
import { InjectionKey } from 'vue'
import VuexPersistence from 'vuex-persist'

type ColorSchemePreference = 'system' | 'dark' | 'light'

export interface State {
  colorScheme: {
    preference: ColorSchemePreference
    value: 'dark' | 'light'
  }
}

export const key: InjectionKey<Store<State>> = Symbol()

const vuexLocal = new VuexPersistence<State>({ storage: window.localStorage })

export const store = createStore<State>({
  state() {
    return {
      colorScheme: {
        preference: 'system',
        value: 'light',
      },
    }
  },
  mutations: {
    setColorScheme(
      state: State,
      payload: { scheme: ColorSchemePreference; persist?: boolean }
    ) {
      let { scheme, persist } = payload
      if (persist === undefined) {
        persist = true
      }
      if (persist) {
        localStorage.setItem('colorScheme', scheme)
      }
      state.colorScheme.preference = scheme as ColorSchemePreference
      if (scheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        state.colorScheme.value = isDark ? 'dark' : 'light'
      }
    },
  },
  plugins: [vuexLocal.plugin],
})
