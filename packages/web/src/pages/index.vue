<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main>
    {{ t('description') }}
    <div class="skeleton h-12 w-12"></div>
  </main>
</template>

<i18n>
{
  "en": {
    "description": "welcome to Hanas!"
  }
}
</i18n>
