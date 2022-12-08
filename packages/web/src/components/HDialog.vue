<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'

defineProps<{
  show: boolean
  dividers?: boolean
}>()

const emit = defineEmits<{
  (e: 'dismissed'): any
}>()
</script>

<template>
  <TransitionRoot :show="show">
    <Dialog @close="emit('dismissed')" class="relative z-10">
      <div class="dialog-container">
        <TransitionChild
          enter="dialog-enter-active"
          enter-from="dialog-enter-from"
          enter-to="dialog-enter-to"
          leave="dialog-leave-active"
          leave-from="dialog-leave-from"
          leave-to="dialog-leave-to"
        >
          <DialogPanel class="panel">
            <div v-if="$slots.icon" class="icon-container pb-4">
              <slot name="icon" />
            </div>
            <DialogTitle :class="{ 'text-center': $slots.icon }">
              <slot name="title" />
            </DialogTitle>
            <DialogDescription>
              <div class="description-container">
                <slot name="description" />
              </div>
              <div v-if="$slots.interactive" class="interactive-container">
                <slot name="interactive" />
              </div>
              <footer class="flex justify-end gap-2">
                <slot name="footer" />
              </footer>
            </DialogDescription>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
  <Scrim :show="show" />
</template>

<style scoped>
.dialog-enter-active {
  perspective: none;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-leave-active {
  perspective: none;
  transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from {
  transform-origin: top;
  transform: scale(0.95) translateY(-1rem) rotate3d(0, 1, 0, -10deg);
}
.dialog-leave-to {
  transform-origin: bottom;
  transform: scale(0.95) translateY(1rem) rotate3d(0, 1, 0, 10deg);
}

.icon-container {
  @apply text-secondary-light dark:text-secondary-dark flex flex-row justify-center;
}
.panel {
  @apply min-w-280px max-w-560px bg-surface-light dark:bg-surface-dark z-50 rounded-3xl p-7 shadow-lg;
}
.dialog-container {
  @apply fixed top-0 left-0 flex justify-center items-center w-screen h-screen;
}
.interactive-container {
  @apply border-b border-t border-outline-light dark:border-outline-dark py-4 mb-6 text-on-surface-variant;
}
.description-container {
  @apply pb-6 text-on-surface-variant;
}
h2 {
  @apply text-xl leading-snug pb-4;
}
</style>

<style>
.icon-container > svg {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
