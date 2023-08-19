import type { Locale } from 'petite-vue-i18n'
import { createI18n, useI18n as _useI18n } from 'petite-vue-i18n'
import type { App } from 'vue'

const i18n = createI18n({
  legacy: false,
  locale: '',
  messages: {},
  fallbackWarn: false,
  fallbackLocale: 'en'
})

const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../locales/*.yml')).map(([path, loadLocale]) => [
    path.match(/([\w-]*)\.yml$/)?.[1],
    loadLocale
  ])
) as Record<Locale, () => Promise<{ default: Record<string, string> }>>

export const availableLocales = Object.keys(localesMap)

const loadedLanguages: string[] = []

function setI18nLanguage(lang: Locale) {
  i18n.global.locale.value = lang as any
  if (typeof document !== 'undefined') document.querySelector('html')?.setAttribute('lang', lang)
  return lang
}

export async function loadLanguageAsync(lang: string): Promise<Locale> {
  // If the same language
  if (i18n.global.locale.value === lang) return setI18nLanguage(lang)

  // If the language was already loaded
  if (loadedLanguages.includes(lang)) return setI18nLanguage(lang)

  // If the language hasn't been loaded yet
  const messages = await localesMap[lang]()
  i18n.global.setLocaleMessage(lang, messages.default)
  loadedLanguages.push(lang)
  return setI18nLanguage(lang)
}

export const installI18n = (app: App<Element>) => {
  app.use(i18n)
  loadLanguageAsync('en')
}

export const useI18n = (options: Parameters<_useI18n>[0]) => _useI18n({
    inheritLocale: true,
    ...options
})