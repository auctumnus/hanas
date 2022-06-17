<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'
const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

defineProps<{
  modelValue: boolean
}>()

const close = () => emit('update:modelValue', false)
</script>

<template>
  <Scrim :show="modelValue" />
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="close()" :open="modelValue" class="relative z-10">
      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-90"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Payment successful
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Your payment has been successfully submitted. We’ve sent you
                  an email with all of the details of your order.
                </p>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
