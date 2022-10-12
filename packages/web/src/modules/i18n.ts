import { createI18n } from 'petite-vue-i18n'
import type { UserModule } from '~/types'

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
//
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
const messages = Object.fromEntries(
  Object.entries(import.meta.globEager('../../locales/*.y(a)?ml')).map(
    ([key, value]) => {
      const yaml = key.endsWith('.yaml')
      return [key.slice(14, yaml ? -5 : -4), value.default]
    }
  )
)

export const install: UserModule = ({ isClient, app }) => {
  const locale =
    (isClient
      ? localStorage.getItem('locale') || navigator.language.split('-')[0]
      : false) || 'en'

  const i18n = createI18n({
    legacy: false,
    locale,
    messages,
  })

  app.use(i18n)
}
