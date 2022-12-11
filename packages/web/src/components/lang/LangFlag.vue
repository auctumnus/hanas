<script setup lang="ts">
import { Lang } from '@hanas-app/api-helper'
const props = defineProps<{
  lang?: Lang
  size?: 'sm' | 'md' | 'lg'
}>()

// TODO: change this to use actual logic once flags are added on backend
const url = '/hanas-default-flag.png'
const s = {
  sm: 'h-6 max-w-12',
  md: 'h-8 max-w-16',
  lg: 'h-12 max-w-24',
}[props.size || 'sm']
</script>

<template>
  <img :src="url" class="rounded" :class="[s]" />
</template>
