<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main>
    {{ t('description') }}
  </main>
</template>

<i18n>
{
  "en": {
    "description": "welcome to Hanas!"
  }
}
</i18n>
