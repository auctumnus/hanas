<script setup lang="ts">
import { MenuItem } from '@headlessui/vue'
defineProps<{
  content: string
  trailingText?: string
  disabled?: boolean
}>()
</script>

<template>
  <MenuItem as="div" class="popup-menu-item">
    <div
      class="flex flex-row items-center gap-3"
      :class="{ 'opacity-38': disabled }"
    >
      <slot name="icon" />
      <span>{{ content }}</span>
    </div>
    <slot v-if="!trailingText" name="trailing-icon" />
    <span v-else>{{ trailingText }}</span>
  </MenuItem>
</template>

<style>
.popup-menu-item {
  @apply px-3 py-2 flex flex-row items-center h-12 cursor-pointer interactable-bg-surface;
}

.popup-menu-item:disabled {
  @apply cursor-not-allowed bg-surface;
}

.popup-menu-item svg {
  @apply text-on-surface-variant;
}

.popup-menu-item:disabled svg {
  @apply text-on-surface;
}

.popup-menu-item:first-child {
  @apply rounded-t;
}
.popup-menu-item:last-child {
  @apply rounded-b;
}
</style>
