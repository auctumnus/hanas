<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <button :aria-label="label" class="icon-button">
    <slot />
  </button>
</template>

<style>
.icon-button {
  @apply h-10 w-10 flex justify-center items-center rounded-full interactable-bg-surface;
}
.icon-button svg {
  @apply h-6 w-6;
}
.icon-button:active svg {
  @apply text-primary;
}
</style>
