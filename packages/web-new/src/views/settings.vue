<script setup lang="ts">
import { ref } from 'vue'
import { HSelect } from 'halcyon-vue'
import LanguageSelect from '@/components/settings/LanguageSelect.vue'
import AppearTransition from '@/components/AppearTransition.vue'
import { isCompact } from '@/size'

const themes = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' }
]

const theme = ref('system')

const languages = [
  { label: 'English', value: 'en' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' }
]

const language = ref('en')
</script>

<template>
  <main>
    <appear-transition>
      <h1 class="display-large" v-if="!isCompact">Settings</h1>
    </appear-transition>

    <section>
      <h1 class="title-large">Theme</h1>
      <h-select v-model="theme" label="Theme" :options="themes" />
    </section>

    <section>
      <div>
        <h1 class="title-large">Language</h1>
        <h2 class="body-large">The language Hanas is displayed in.</h2>
      </div>
      <language-select />
    </section>
  </main>
</template>

<style scoped lang="scss">
main {
  margin-left: 32px;
}

section {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 50ch;

  align-items: center;

  & + section {
    margin-top: 8px;
  }
}
</style>
