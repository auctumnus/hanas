<script setup lang="ts">
import { isSmall } from '~/composables/device-size'
import { Lang } from '@hanas-app/api-helper'
const props = defineProps<{
  lang: Lang
}>()

const lang = props.lang
</script>

<template>
  <router-link :to="'/langs/' + lang.code" class="lang-details">
    <LangFlag :lang="lang" class="h-6 mr-4" />
    <div class="flex flex-col overflow-hidden">
      <div class="flex flex-row items-center gap-2">
        <span class="text-lg">{{ lang.name }}</span>
        <span class="uppercase text-sm text-on-surface-variant">
          ({{ lang.code }})
        </span>
      </div>
      <span class="text-on-surface-variant truncate">
        {{ lang.description }}
      </span>
    </div>
    <ContributorsSummary v-if="!isSmall" class="ml-4" :lang="lang" />
  </router-link>
</template>

<style scoped>
.lang-details {
  @apply flex flex-row overflow-hidden
         gap-2 items-center py-2 pl-4 pr-6
         border-b border-outline 
         h-18;
}
</style>
