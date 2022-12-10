<script setup lang="ts">
import { Lang } from '@hanas-app/api-helper'
const props = defineProps<{
  lang?: Lang
  size?: 'sm' | 'md' | 'lg'
}>()

// TODO: change this to use actual logic once flags are added on backend
const url = '/hanas-default-flag.png'
</script>

<template>
  <img :src="url" class="h-4 rounded" />
</template>
