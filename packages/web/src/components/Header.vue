<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()

defineEmits<{
  (event: 'menu-closed'): void
  (event: 'menu-opened'): void
}>()
</script>

<template>
  <header
    class="fixed z-5 top-0 left-0 flex row justify-between items-center px-4 py-2 h-16 w-full bg-surface-light dark:bg-surface-dark"
  >
    <HMenuButton
      @menu-closed="$emit('menu-closed')"
      @menu-opened="$emit('menu-opened')"
    />
    <h1 class="text-xl text-on-surface-light dark:text-on-surface-dark">
      {{ $route.meta.title ? t($route.meta.title) : 'Hanas' }}
    </h1>
    <UserMenu />
  </header>
</template>
