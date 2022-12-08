<script setup lang="ts">
import { computed } from '@vue/reactivity'
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps({
  name: {
    type: String,
  },
  destination: {
    type: String,
  },
  isRail: {
    type: Boolean,
    default: false,
  },
  railIncludeName: {
    type: Boolean,
    default: false,
  },
  labelText: {
    type: String,
    default: '',
  },
  notificationIcon: {
    type: Boolean,
    default: false,
  },
})

const isActive = computed(() => {
  return props.destination === route.path
})
</script>

<template>
  <router-link
    :title="name + (labelText ? ` (${labelText})` : '')"
    :aria-label="name + (labelText ? ` (${labelText})` : '')"
    :to="destination"
    class="flex items-center rounded-2xl pl-4 h-14 mx-3 text-sm font-medium transition duration-150"
    :class="{
      'flex-col justify-center pr-4': isRail,
      'w-14': isRail && !railIncludeName,
      'flex-row pr-6': !isRail,

      [`
                text-on-surface-variant
                interactable-bg-surface-light dark:interactable-bg-surface-dark
            `]: !isActive,
      [`
                interactable-bg-secondary-container-light dark:interactable-bg-secondary-container-dark
                text-on-secondary-container-light dark:text-on-secondary-container-dark
                
            `]: isActive,
    }"
  >
    <span
      class="menu-item-icon-slot"
      :class="{ 'menu-item-icon-slot-notification': notificationIcon }"
    >
      <slot></slot>
      <div
        v-if="notificationIcon"
        class="relative bg-error-light dark:bg-error-dark w-6px h-6px -top-24px left-22px rounded-full"
      >
        &nbsp;
      </div>
    </span>
    <!-- i am NOT joking -0.5px makes it perfectly aligned. -->
    <span
      v-if="(isRail && railIncludeName) || !isRail"
      class="relative ml-3 -top-0.5px flex-1 whitespace-nowrap"
    >
      {{ name }}
    </span>
    <span
      class="relative tabular-nums whitespace-nowrap overflow-hidden"
      v-if="labelText"
      :class="{
        '-top-1': isRail,
        '-top-0.5px': !isRail,
      }"
    >
      {{ labelText }}
    </span>
  </router-link>
</template>

<style>
/* kind of a hack but w/e */
.menu-item-icon-slot > svg.icon {
  @apply h-6 w-6;
  position: relative;
  top: 1px;
}
.menu-item-icon-slot-notification > svg.icon {
  @apply relative top-5px;
}
</style>
