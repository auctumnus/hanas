<script setup lang="ts">
import Navigation from './components/ui/Navigation.vue'
import { isCompact } from '@/size'
import { computed } from 'vue'

const mainMargin = computed(() => (isCompact.value ? '8px' : '88px'))
</script>

<template>
  <Navigation />
  <RouterView />
</template>

<style>
main {
  margin-left: v-bind(mainMargin);
}
</style>
