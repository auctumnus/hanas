<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  (event: 'dismissed'): any
}>()
</script>

<template>
  <Transition name="fade">
    <div
      class="fixed top-0 left-0 w-screen h-screen z-5 bg-black opacity-40"
      aria-hidden="true"
      @click="$emit('dismissed')"
      @wheel.passive="$emit('dismissed')"
      ref="scrim"
      v-if="show"
    ></div>
  </Transition>
</template>

<style scoped>
.fade-enter-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
