<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'

const props = defineProps<{
  show: boolean
  dividers?: boolean
}>()

const emit = defineEmits<{
  (e: 'dismissed'): any
}>()
</script>

<template>
  <!-- TODO: There's some issue here with the transition root that I don't
       understand, where <Dialog> needs to not have :open (and should instead
       have that state handled by <TransitionRoot>), but it throws if that's
       the case, when the same snippet from the docs works.
       Oh well.
  -->
  <Dialog :open="show" @close="emit('dismissed')" class="relative z-10">
    <div
      class="fixed top-0 left-0 flex justify-center items-center w-screen h-screen"
    >
      <Transition name="dialog" appear>
        <DialogPanel
          class="min-w-280px max-w-560px bg-surface-light dark:bg-surface-dark z-50 rounded-3xl p-7 shadow-lg"
        >
          <div v-if="$slots.icon" class="icon-container pb-4">
            <slot name="icon" />
          </div>
          <DialogTitle
            class="text-xl leading-snug pb-4"
            :class="{ 'text-center': $slots.icon }"
          >
            <slot name="title" />
          </DialogTitle>
          <DialogDescription>
            <div
              class="pb-6 text-on-surface-variant-light dark:text-on-surface-variant-dark"
            >
              <slot name="description" />
            </div>
            <div
              v-if="$slots.interactive"
              class="border-b border-t border-outline-light dark:border-outline-dark py-4 mb-6 text-on-surface-variant-light dark:text-on-surface-variant-dark"
            >
              <slot name="interactive" />
            </div>
            <footer class="flex justify-end gap-2">
              <slot name="footer" />
            </footer>
          </DialogDescription>
        </DialogPanel>
      </Transition>
    </div>
  </Dialog>
  <Scrim :show="show" />
</template>

<style scoped>
.dialog-enter-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-1rem);
  transform-origin: top;
}

.icon-container {
  @apply text-secondary-light dark:text-secondary-dark flex flex-row justify-center;
}
</style>

<style>
.icon-container > svg {
  height: 1.5rem;
  width: 1.5rem;
}
</style>
