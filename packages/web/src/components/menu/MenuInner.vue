<script setup lang="ts">
import { useI18n } from 'petite-vue-i18n'

import { computed } from 'vue'
import { isLarge, isMedium } from '~/composables/device-size'

const { t } = useI18n()

const props = defineProps<{
  isMenuOpen: boolean
  railable: boolean
}>()

defineEmits<{
  (event: 'close-menu'): void
}>()

const isRail = computed(
  () => props.railable && !props.isMenuOpen && !isLarge.value
)
</script>

<template>
  <nav
    id="menu"
    role="menu"
    class="flex flex-col fixed left-0 z-10 rounded-r-lg bg-surface-light dark:bg-surface-dark overflow-y-auto top-0 h-full"
    :class="{
      'w-0 pt-16': !railable && !isMenuOpen,
      'rail-menu w-20 pt-16': railable && !isMenuOpen,
      'w-3/12': isLarge,
      'w-7/12': isMedium && isMenuOpen,
      'w-9/12': isMenuOpen,
    }"
  >
    <h1 class="sr-only">Navigation</h1>
    <span class="flex row px-4 py-2 h-16 items-center" v-if="isMenuOpen">
      <!-- if you change a class here, it should also be changed in MenuButton -->
      <button
        class="h-12 w-12 inline-flex col justify-center items-center transition duration-150"
        @click="$emit('close-menu')"
        :aria-label="t('menu.close')"
        :title="t('menu.close')"
        ref="closeButton"
      >
        <mdi-close class="h-6 w-6" />
      </button>
    </span>
    <section class="flex-1">
      <HMenuItem :name="t('menu.home')" destination="/" :is-rail="isRail">
        <mdi-home-outline />
      </HMenuItem>

      <HMenuItem
        :name="t('menu.languages')"
        destination="/languages"
        :is-rail="isRail"
      >
        <mdi-chat-outline />
      </HMenuItem>

      <HMenuItem
        :name="t('menu.invites')"
        destination="/invites"
        notification-icon
        label-text="3"
        :is-rail="isRail"
      >
        <mdi-mailbox-up-outline />
      </HMenuItem>

      <HMenuItem :name="t('menu.users')" destination="/users" :is-rail="isRail">
        <mdi-account-outline />
      </HMenuItem>
    </section>

    <section class="mb-3">
      <HMenuItem
        :name="t('menu.settings')"
        destination="/settings"
        :is-rail="isRail"
      >
        <mdi-cog-outline />
      </HMenuItem>

      <HMenuItem :name="t('menu.about')" destination="/about" :is-rail="isRail">
        <mdi-help-circle-outline />
      </HMenuItem>
    </section>
  </nav>
</template>

<style scoped>
nav {
  -ms-overflow-style: none;
  scrollbar-width: none;
  transition: width var(--material-timing);
}
nav::-webkit-scrollbar {
  display: none;
}
</style>
