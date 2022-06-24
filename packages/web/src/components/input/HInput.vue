<script lang="ts" setup>
import { get, set } from '@vueuse/core'
import { ref, Ref, computed } from 'vue'

const props = defineProps<{
  name: string
  type: 'outlined' | 'filled'
  inputType?: string
  label: string
  disabled?: boolean
  maxLength?: number
  minLength?: number
  hasError?: boolean
  hasIcon?: boolean
  hasHelper?: boolean

  modelValue: string
}>()

const isFocused = ref(false)

const isActive = computed(() => get(isFocused) || props.modelValue)

const focus = () => {
  set(isFocused, true)
}

const blur = () => {
  set(isFocused, false)
}

const input: Ref<HTMLInputElement | null> = ref(null)

const clean = (s: string) => s.trim().split(/\s+/).join(' ')

const cleanedLength = (min: number, max: number) => (s: string) => {
  const len = clean(s).length
  return len > min && len < max
}

const contentLength = computed(() => clean(get(props.modelValue)).length)

const hasValidLength = computed(() =>
  props.maxLength || props.minLength
    ? cleanedLength(
        props.minLength || 0,
        props.maxLength || Number.POSITIVE_INFINITY
      )(props.modelValue)
    : true
)

const _error = computed(() => props.hasError || !hasValidLength)
</script>

<template>
  <div
    :class="{
      'text-on-surface-light/38 dark:text-on-surface-dark/38': disabled,
    }"
  >
    <div class="relative flex flex-1">
      <input
        :name="name"
        :id="name"
        class="w-full flex flex-col transition-all duration-300 px-4 h-14 rounded-t-md outline-none"
        :class="{
          'interactable-bg-surface-variant-light dark:interactable-bg-surface-variant-dark':
            !disabled && type === 'filled',
          'shadow-outline-light dark:shadow-outline-dark focus:shadow-primary-light dark:focus:shadow-primary-dark':
            !_error,
          'shadow-error-light dark:shadow-error-dark': _error,
          [`bg-on-surface-light/12 dark:bg-on-surface-dark/12
            pointer-events-none`]: disabled,
          'py-4': !isActive,
          'pb-1 pt-4': isActive,
          'pl-14': !!$slots.prepended,
          'pr-14': !!$slots.appended,
        }"
        :value="modelValue"
        @focus="focus"
        @blur="blur"
        @input="$emit('update:modelValue', clean($event?.target?.value))"
        :type="inputType || ''"
        :disabled="disabled"
        :minlength="minLength"
        :maxlength="maxLength"
        ref="input"
      />
      <label
        class="absolute left-0 px-4 right-auto cursor-text transition-all truncate"
        :class="{
          'text-primary-light dark:text-primary-dark': isFocused && !_error,
          'text-error-light dark:text-error-dark': _error,
          'label-active': isActive,
          'py-4': !isActive,
          'pl-14': !!$slots.prepended,
          'pr-14': !!$slots.appended,
        }"
        :for="name"
      >
        {{ label }}
      </label>
      <span
        class="absolute left-4 h-14 flex flex-col justify-center cursor-text transition-colors"
        :class="{ 'text-error-light dark:text-error-dark': _error }"
        v-if="!!$slots.prepended"
        @click="input!.focus()"
      >
        <slot name="prepended" />
      </span>
      <span
        class="absolute right-4 h-14 flex flex-col justify-center cursor-text transition-colors"
        :class="{ 'text-error-light dark:text-error-dark': _error }"
        v-if="!!$slots.appended"
        @click="input!.focus()"
      >
        <slot name="appended" />
      </span>
    </div>
    <div
      class="px-4 pt-1 text-sm transition-colors"
      :class="{
        'text-on-surface-variant-light dark:text-on-surface-variant-dark':
          !_error,
        'text-error-light dark:text-error-dark': _error,
      }"
      v-if="hasHelper"
    >
      <slot name="helper" />
    </div>
  </div>
</template>

<style scoped>
input {
  box-shadow: inset 0 -1px var(--tw-shadow-color);
}
input:focus {
  box-shadow: inset 0 -2px var(--tw-shadow-color);
}
.label-active {
  max-width: 133%;
  transform: translateY(4px);
  font-size: 12px;
}
</style>
