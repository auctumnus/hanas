<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'
import { isHuge } from '~/composables/device-size'
import { useSettingsStore } from '~/stores/settings'
import { ref } from 'vue'

const { t } = useI18n()

const settings = useSettingsStore()

const setTheme = (value: 'auto' | 'light' | 'dark') => {
  settings.themeIsAuto = value === 'auto'
  settings.theme = value
}

const localeModalOpen = ref(false)
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

      <label class="setting">
        <div class="setting-description">
          <h3 class="font-medium">{{ t('appearance.theme') }}</h3>
          <span class="setting-description-text">
            {{ t('appearance.theme.description') }}
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="flex flex-row gap-2">
            <input
              type="radio"
              name="theme"
              id="theme_system"
              value="auto"
              :checked="settings.themeIsAuto"
              @input="setTheme('auto')"
            />
            <span style="white-space: nowrap">{{ t('themes.auto') }}</span>
          </label>
          <label class="flex flex-row gap-2">
            <input
              type="radio"
              name="theme"
              id="theme_dark"
              value="dark"
              :checked="!settings.themeIsAuto && settings.theme === 'dark'"
              @input="setTheme('dark')"
            />
            <span>{{ t('themes.dark') }}</span>
          </label>
          <label class="flex flex-row gap-2">
            <input
              type="radio"
              name="theme"
              id="theme_light"
              value="light"
              :checked="!settings.themeIsAuto && settings.theme === 'light'"
              @input="setTheme('light')"
            />
            <span>{{ t('themes.light') }}</span>
          </label>
        </div>
      </label>
      <button class="setting" @click="localeModalOpen = true">
        <div class="setting-description">
          <span class="font-medium text-left">{{
            t('appearance.locale')
          }}</span>
          <span class="setting-description-text">
            {{ t('appearance.locale.description') }}
          </span>
        </div>
        <div class="flex justify-center items-center">
          <mdi-chevron-right aria-hidden="true" />
        </div>
      </button>
      <LocaleModal
        :open="localeModalOpen"
        @dismissed="localeModalOpen = false"
      />
    </section>
  </main>
</template>

<style scoped>
.setting {
  @apply gap-1 mb-4 flex flex-row justify-between;
}
.setting-description {
  @apply flex flex-col;
}

.setting-description-text {
  @apply text-sm text-on-surface-variant;
}
</style>

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
    
        "themes.auto": "Seguir la sistema",
        "themes.light": "Claro",
        "themes.dark": "Oscuro"
    }
}
</i18n>

<route lang="yaml">
meta:
  title: 'route.settings'
</route>
