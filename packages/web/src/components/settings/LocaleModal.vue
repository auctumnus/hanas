<script setup lang="ts">
import { get, set } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { ref } from 'vue'
import HDialog from '../HDialog.vue'
import HButton from '../input/HButton.vue'

const nativeNames = {
  en: 'English',
  es: 'Español',
}

defineProps<{
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

const formatLocale = (l: string) => {
  const translated = t(`locales.${l}`)
  const nativeName = nativeNames?.[l]
  if (!nativeName || nativeName === translated) {
    return translated
  } else {
    return `${translated} (${nativeName})`
  }
}
</script>

<template>
  <HDialog :show="open" dividers @dismissed="emit('dismissed')">
    <template #icon><mdi-translate /></template>
    <template #title>
      {{ t('appearance.locale') }}
    </template>
    <template #description>
      {{ t('appearance.locale.select') }}
    </template>
    <template #interactive>
      <div
        class="flex flex-col gap-4 max-h-300px overflow-auto text-lg leading-tight"
      >
        <label
          v-for="l in availableLocales"
          class="flex flex-row items-center gap-4 px-4"
        >
          <input
            type="radio"
            name="locale"
            :id="`locale_${l}`"
            :value="l"
            :checked="locale === l"
            v-model="selectedLocale"
          />
          <span>{{ formatLocale(l) }}</span>
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
    "appearance.locale.select": "Choose a language",

    "locales.en": "English",
    "locales.es": "Spanish"
  },
  "es": {
    "appearance.locale": "Idioma de visualización",
    "appearance.locale.select": "Selecciona una idioma",

    "locales.en": "Inglés",
    "locales.es": "Español"
  }
}
</i18n>
