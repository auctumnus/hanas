<script setup lang="ts">
import { HDialog } from 'halcyon-vue'
import { ref, computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { loadLanguageAsync } from '@/i18n'

const { t } = useI18n()
const { availableLocales } = useI18n({ useScope: 'global' })

const open = ref(false)

const selected = ref('en')

const actions = [
    { label: t('cancel'), onClick: () => {  } },
    { label: t('save'),   onClick: () => {  } }
]

const nativeNames = {
    en: 'English',
    de: 'Deutsch',
    es: 'Español'
}

console.log(availableLocales)

const formatLocale = (l: string) => {
  const translated = t(`locale.${l}`)
  const nativeName = nativeNames?.[l]
  if (!nativeName || nativeName === translated) {
    return translated
  } else {
    return computed(() => `${translated} (${nativeName})`)
  }
}
</script>

<template>
    <button @click="open = true">
        <span>English</span>
        <mdi-triangle-small-down />
    </button>
    <h-dialog
        title="Language"
        :description="t('dialog_description')"
        dividers

        :actions="actions"
        v-model:open="open"
    >
        <template #icon>
            <mdi-translate />
        </template>
        <template #content>
            <section class="languages">
                <label class="label-large" v-for="locale in availableLocales" :key="locale">
                    <input type="radio" :value="locale" v-model="selected" />
                    <span>{{ formatLocale(locale) }}</span>
                </label>
            </section>
        </template>
    </h-dialog>
</template>

<i18n lang="yaml">
en:
    dialog_description: Choose the language that Hanas is displayed in
    locale.en: English
    locale.de: German
    locale.es: Spanish
de:
    dialog_description: Wähle die Sprache, in der Hanas angezeigt wird
    locale.en: Englisch
    locale.de: Deutsch
    locale.es: Spanisch
</i18n>

<style scoped lang="scss">
button {
    position: relative;
    height: 56px;
    min-width: 112px;
    max-width: 280px;
    padding: 16px;
    transition-timing-function: cubic-bezier(.2,0,0,1);
    transition-duration: .2s;
    transition-property: border-color,outline-color,color;
    white-space: pre-wrap;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: .5;
    color: var(--halcyon-on-surface);
    margin-right: 16px;

    border-radius: 6px;
    outline: 1px solid var(--halcyon-outline);
    background-color: transparent;

    &:focus:not(:focus-visible) {
        outline: 1px solid var(--halcyon-outline) !important;
    }
    &.open {
        &:focus:not(:focus-visible) {
            outline: 2px solid var(--halcyon-primary) !important;
        }
        outline: 2px solid var(--halcyon-primary);
    }

    &:disabled {
        outline-color: var(--halcyon-on-surface-o38);
        pointer-events: none;
    }
}

.languages {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
}

input {
    margin: 10px;
    width: 20px;
    height: 20px;
    accent-color: var(--halcyon-primary);
    background-color: transparent;
}

label {
    font-weight: 500;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}
</style>