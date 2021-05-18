<template>
  <button @click="toggleDark" class="icon-btn" aria-label="Toggle dark mode">
    <i-carbon-moon v-if="isDark" />
    <i-carbon-sun v-else />
  </button>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>
