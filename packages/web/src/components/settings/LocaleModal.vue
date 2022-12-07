<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { ref } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'dismissed'): any
}>()

const { t } = useI18n()
const { availableLocales, locale } = useI18n({ useScope: 'global' })

const selectedLocale = ref(get(locale))

const setLocale = (value: string) => {
  set(locale, value)
  localStorage.setItem('locale', value)
}

const confirm_ = () => {
  setLocale(get(selectedLocale))
  emit('dismissed')
}
</script>

<template>
  <HDialog :show="open" dividers @dismissed="emit('dismissed')">
    <template #icon><mdi-translate /></template>
    <template #title>
      {{ t('appearance.locale') }}
    </template>
    <template #description>
      {{ t('appearance.locale.description') }}
    </template>
    <template #interactive>
      <div class="flex flex-col gap-1 max-h-300px overflow-auto">
        <label v-for="l in availableLocales" class="flex flex-row gap-2">
          <input
            type="radio"
            name="locale"
            :id="`locale_${l}`"
            :value="l"
            :checked="locale === l"
            v-model="selectedLocale"
          />
          <span>{{ t('locales.' + l) }}</span>
        </label>
      </div>
    </template>
    <template #footer>
      <HButton kind="text" content="Cancel" @click="emit('dismissed')" />
      <HButton kind="text" content="Confirm" @click="confirm_" />
    </template>
  </HDialog>
</template>

<i18n>
{
  "en": {
    "appearance.locale": "Display language",
    "appearance.locale.description": "Change the language Hanas is displayed in",
    "appearance.locale.select": "Choose a language",

    "locales.en": "English",
    "locales.es": "Spanish"
  },
  "es": {
    "appearance.locale": "Idioma de visualización",
    "appearance.locale.description": "Seleccionar la idioma en que Hanas es presentado",
    "appearance.locale.select": "Seleccionar una idioma",

    "locales.en": "Inglés",
    "locales.es": "Español"
  }
}
</i18n>
