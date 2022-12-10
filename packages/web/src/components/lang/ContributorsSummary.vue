<script setup lang="ts">
import { Lang } from '@hanas-app/api-helper'
const props = defineProps<{ lang: Lang }>()
</script>

<template>
  <div class="contributors-summary flex flex-row">
    <ProfilePicture username="arisu" class="pfp z-2" />
    <ProfilePicture username="example_user" class="pfp z-1" />
    <ProfilePicture username="alice" class="pfp" />
  </div>
</template>

<style scoped>
.pfp {
  @apply h-12 w-12;
}
.pfp:not(:last-of-type) {
  @apply -mr-5;
}
</style>

<style>
.contributors-summary > .pfp > img {
  @apply border-surface-light dark:border-surface-dark border;
}
</style>
