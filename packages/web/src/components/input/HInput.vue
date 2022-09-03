<script lang="ts" setup>
import { get, set } from '@vueuse/core'
import { ref, Ref, computed, onMounted, onUpdated } from 'vue'

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
  multiline?: boolean
  rows?: number

  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', modelValue: string): any
  (e: 'focus', ev: FocusEvent): any
  (e: 'blur', ev: FocusEvent): any
}>()

/* Focus stuff */
const isFocused = ref(false)

const isActive = computed(() => get(isFocused) || props.modelValue)

const focus = (e: FocusEvent) => {
  set(isFocused, true)
  emit('focus', e)
}

const blur = (e: FocusEvent) => {
  set(isFocused, false)
  emit('blur', e)
}

const _rows = props.rows || 3

/* Error state and length checks */
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

const input: Ref<HTMLInputElement | null> = ref(null)

const updateRows = () => {
  if (props.multiline) {
    const i = get(input)!
    i.style.height = '0'
    const height = i.scrollHeight

    const fontSize = window
      .getComputedStyle(i)
      .getPropertyValue('font-size')
      .match(/\d+/)
    if (!fontSize) return undefined

    i.style.height = Math.max(height, _rows * +fontSize[0]) + 7 + 'px'
  }
}

const onInput = () => {
  emit('update:modelValue', clean(get(input)?.value || ''))
  updateRows()
}

onMounted(() => {
  updateRows()
  if (window && window.onresize) {
    // im tired
    // @ts-ignore
    window.onresize(() => updateRows())
  }
})

onUpdated(() => {
  updateRows()
})
</script>

<template>
  <div
    :class="{
      'text-on-surface-light/38 dark:text-on-surface-dark/38': disabled,
    }"
  >
    <div class="relative flex flex-1">
      <component
        :is="multiline ? 'textarea' : 'input'"
        :name="name"
        :id="name"
        class="w-full flex flex-col transition duration-300 px-4 h-14 rounded-t-md outline-none"
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
        @input="onInput"
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
      class="px-4 pt-1 text-sm transition-colors flex flex-row justify-between"
      :class="{
        'text-on-surface-variant-light dark:text-on-surface-variant-dark':
          !_error,
        'text-error-light dark:text-error-dark': _error,
      }"
      v-if="!!$slots.helper || maxLength"
    >
      <span><slot name="helper" /></span>
      <span class="tabular-nums" v-if="maxLength">
        {{ contentLength }}/{{ maxLength }}
      </span>
    </div>
  </div>
</template>

<style scoped>
textarea {
  font-family: inherit;
  resize: none;
}
input,
textarea {
  box-shadow: inset 0 -1px var(--tw-shadow-color);
}
input:focus,
textarea:focus {
  box-shadow: inset 0 -2px var(--tw-shadow-color);
}
.label-active {
  max-width: 133%;
  transform: translateY(4px);
  font-size: 12px;
}
</style>
