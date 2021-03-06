<script setup lang="ts">
import { set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { isSmall, isHuge } from '~/composables/device-size'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { useSettingsStore } from '~/stores/settings'

const { t } = useI18n()

const { availableLocales, locale } = useI18n({ useScope: 'global' })

const setLocale = (value: string) => {
  set(locale, value)
  localStorage.setItem('locale', value)
}

const settings = useSettingsStore()

const setTheme = (value: 'auto' | 'light' | 'dark') => {
  settings.themeIsAuto = value === 'auto'
  settings.theme = value
}
</script>

<template>
  <main>
    <p>
      <b class="font-bold">{{ t('intro.note') }}</b>
      {{ t('intro.settings_are') }}
      <span class="underline underline-current">{{
        t('intro.local_only')
      }}</span>
      {{ t('intro.and_will') }}
      <span class="underline underline-current">{{ t('intro.not') }}</span>
      {{ t('intro.persist') }}
    </p>

    <section class="flex flex-col gap-1 mt-1" :class="{ 'w-9/12': isHuge }">
      <h2 class="text-lg font-semibold mt-4">
        {{ t('appearance') }}
      </h2>

      <label class="ml-1 mb-4 flex flex-row justify-between">
        <div class="flex flex-col">
          <span class="font-medium">{{ t('appearance.theme') }}</span>
          <span
            class="text-sm text-on-surface-variant-light dark:text-on-surface-variant-dark"
          >
            {{ t('appearance.theme.description') }}
          </span>
        </div>
        <Listbox @update:model-value="setTheme">
          <div class="w-40">
            <ListboxButton
              class="font-normal w-full flex flex-row justify-between px-3 py-2 rounded border-outline-light dark:border-outline-dark border"
            >
              <span>{{
                t(
                  settings.themeIsAuto
                    ? 'themes.auto'
                    : `themes.${settings.theme}`
                )
              }}</span>
              <mdi-chevron-down class="pt-1" aria-hidden="true" />
            </ListboxButton>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <ListboxOptions
                class="absolute mt-1 w-40 z-10 overflow-auto rounded-md shadow-md shadow-gray-400 dark:shadow-dark-900 list-none pl-0 bg-surface-light dark:bg-surface-dark"
                :class="{
                  'text-sm': isSmall,
                }"
              >
                <ListboxOption
                  v-slot="{ active }"
                  v-for="theme of ['auto', 'light', 'dark']"
                  :value="theme"
                >
                  <div
                    class="flex flex-row items-center interactable-bg-surface-light dark:interactable-bg-surface-dark px-3 py-2 h-12"
                    :class="{
                      'font-semibold':
                        (!settings.themeIsAuto && theme === settings.theme) ||
                        (settings.themeIsAuto && theme === 'auto'),
                      '!bg-on-surface-light/12 !dark:bg-on-surface-dark/12':
                        active,
                    }"
                  >
                    {{ t(`themes.${theme}`) }}
                  </div>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </label>

      <label class="ml-1 mb-4 flex flex-row justify-between">
        <div class="flex flex-col">
          <span class="font-medium">{{ t('appearance.locale') }}</span>
          <span
            class="text-sm text-on-surface-variant-light dark:text-on-surface-variant-dark"
          >
            {{ t('appearance.locale.description') }}
          </span>
        </div>

        <Listbox @update:model-value="setLocale">
          <div class="w-40">
            <ListboxButton
              class="font-normal w-full flex flex-row justify-between px-3 py-2 rounded border-outline-light dark:border-outline-dark border"
            >
              <span>{{ t(`locales.${locale}`) }} ({{ locale }})</span>
              <mdi-chevron-down class="pt-1" aria-hidden="true" />
            </ListboxButton>
            <transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <ListboxOptions
                class="absolute mt-1 w-40 z-10 overflow-auto rounded-md shadow-md shadow-gray-400 dark:shadow-dark-900 list-none pl-0 bg-surface-light dark:bg-surface-dark"
                :class="{
                  'text-sm': isSmall,
                }"
              >
                <ListboxOption
                  v-slot="{ active }"
                  v-for="l of availableLocales"
                  :value="(l as string)"
                >
                  <div
                    class="flex flex-row items-center interactable-bg-surface-light dark:interactable-bg-surface-dark px-3 py-2 h-12"
                    :class="{
                      'font-semibold': l === locale,
                      '!bg-on-surface-light/12 !dark:bg-on-surface-dark/12':
                        active,
                    }"
                  >
                    {{ t(`locales.${l}`) }} ({{ l }})
                  </div>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </label>
    </section>
  </main>
</template>

<i18n>
{
    "en": {
        "intro.note": "Note:",
        "intro.settings_are": "These settings are",
        "intro.local_only": "local only",
        "intro.and_will": "and will",
        "intro.not": "not",
        "intro.persist": "persist between browsers.",

        "appearance": "Appearance",
        "appearance.theme": "Theme",
        "appearance.theme.description": "Toggle between the light and dark mode",
        "appearance.locale": "Display language",
        "appearance.locale.description": "Change the language Hanas is displayed in",
        "appearance.locale.select": "Choose a language",

        "locales.en": "English",
        "locales.es": "Spanish",

        "themes.auto": "Follow system",
        "themes.light": "Light",
        "themes.dark": "Dark"
    },
    "es": {
        "intro.note": "Nota:",
        "intro.settings_are": "Esta configuración es",
        "intro.local_only": "solo local",
        "intro.and_will": "y",
        "intro.not": "no",
        "intro.persist": "va persistir entre navegadores.",

        "appearance": "Mostrar",
        "appearance.theme": "Modo",
        "appearance.theme.description": "Alternar entre el modo claro y el modo oscuro",
        "appearance.locale": "Idioma de visualización",
        "appearance.locale.description": "Seleccionar la idioma en que Hanas es presentado",
        "appearance.locale.select": "Seleccionar una idioma",

        "locales.en": "Inglés",
        "locales.es": "Español"
    }
}
</i18n>

<route lang="yaml">
meta:
  title: 'route.settings'
</route>
