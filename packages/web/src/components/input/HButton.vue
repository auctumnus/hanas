<script setup lang="ts">
import { get, refDefault } from '@vueuse/core'
import { computed, ref, useSlots } from 'vue'

/*
TODO: bc of a lack of elevation semantics, the elevated button is barely readable. can we
fix this, ideally in material language, extra-materially if needed?
*/

const props = defineProps<{
  kind: 'elevated' | 'filled' | 'filled tonal' | 'outline' | 'text'
  disabled?: boolean
  content: string
  label?: string
  as?: 'button' | 'router-link'
  href?: string
}>()

const _label = refDefault(ref(props.label), props.content)

const _as = refDefault(ref(props.as), 'button')

const slots = useSlots()

const iconPadding = computed(() => (!!slots.default ? 'pl-4' : ''))

const colorClasses = computed(() => {
  if (
    props.disabled &&
    (props.kind === 'filled' ||
      props.kind === 'filled tonal' ||
      props.kind === 'elevated')
  ) {
    return (
      `
            bg-on-surface-light/12 dark:bg-on-surface-dark/12
            text-on-surface-light/38 dark:text-on-surface-dark/38
            pointer-events-none
        ` + get(iconPadding)
    )
  } else if (props.kind === 'elevated') {
    return (
      `
            interactable-bg-surface-light dark:interactable-bg-surface-dark

            text-primary-light dark:text-primary-dark

            shadow-sm shadow-gray-400 dark:shadow-dark-900
        ` + get(iconPadding)
    )
  } else if (props.kind === 'filled') {
    return (
      `
            interactable-bg-primary-light dark:interactable-bg-primary-dark
            text-on-primary-light dark:text-on-primary-dark
        ` + get(iconPadding)
    )
  } else if (props.kind === 'filled tonal') {
    return (
      `
            interactable-bg-secondary-container-light dark:interactable-bg-secondary-container-dark
            text-on-secondary-container-light dark:text-on-secondary-container-dark
        ` + get(iconPadding)
    )
  } else if (props.kind === 'outline') {
    if (props.disabled) {
      return (
        `
                border border-on-surface-light/12 dark:border-on-surface-dark/12
                text-on-surface-light/38 dark:text-on-surface-dark/38

                pointer-events-none
            ` + get(iconPadding)
      )
    } else {
      return (
        `
            border border-outline-light dark:border-outline-dark
            text-primary-light dark:text-primary-dark

            bg-primary-light dark:bg-primary-dark !bg-opacity-0
            
            !hover:bg-opacity-8
            !focus:bg-opacity-12
            !active:bg-opacity-12
        ` + get(iconPadding)
      )
    }
  } else if (props.kind === 'text') {
    if (props.disabled) {
      return (
        `
                text-on-surface-light/38 dark:text-on-surface-dark/38

                pointer-events-none
            ` + get(iconPadding)
      )
    } else {
      return (
        `
            text-primary-light dark:primary-dark

            bg-primary-light dark:bg-primary-dark !bg-opacity-0
            
            !hover:bg-opacity-8
            !focus:bg-opacity-12
            !active:bg-opacity-12
        ` + get(iconPadding)
      )
    }
  }
})
</script>

<template>
  <component
    :is="_as"
    :to="props.href"
    class="align-middle common-button flex flex-row justify-center items-center rounded-3xl h-10 whitespace-nowrap px-6 gap-1 font-medium"
    :aria-label="_label"
    :title="_label"
    :class="colorClasses"
    :disabled="disabled"
  >
    <slot />
    <span class="align-middle" v-if="content">{{ content }}</span>
  </component>
</template>

<style>
button.common-button span {
  position: relative;
  top: -1px;
}

button.common-button svg.icon,
a.common-button svg.icon {
  top: 1px;
}
</style>
