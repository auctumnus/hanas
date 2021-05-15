<template>
  <div
    class="
      min-h-screen
      bg-light2
      text-dark0
      dark:bg-dark0
      dark:text-light0
      flex flex-col
    "
  >
    <main class="flex-grow">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useDark } from '@vueuse/core'
useHead({ title: 'Hanas' })
useDark()
</script>

<style scoped>
main {
  font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
