<script setup lang="ts">
import { set, useSwipe, whenever } from '@vueuse/core'
import { useI18n } from 'petite-vue-i18n'
import { onUnmounted, ref } from 'vue'
import { isMedium, isHuge } from '~/composables/device-size'

const { t } = useI18n()

const emit = defineEmits<{
  (event: 'menu-closed'): void
  (event: 'menu-opened'): void
}>()

const isMenuOpen = ref(false)

const openMenu = () => {
  emit('menu-opened')
  set(isMenuOpen, true)
}
const closeMenu = () => {
  emit('menu-closed')
  set(isMenuOpen, false)
}

const closeMenuKeybind = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMenu()
  }
}

document.addEventListener('keydown', closeMenuKeybind)

onUnmounted(() => document.removeEventListener('keydown', closeMenuKeybind))

const root = document.querySelector(':root')!

const { isSwiping, direction } = useSwipe(ref(root))

whenever(isSwiping, () => {
  if (direction.value === 'RIGHT') {
    openMenu()
  } else {
    closeMenu()
  }
})
</script>

<template>
  <!-- if you change a class here, it should also be changed on the in MenuInner -->
  <Transition name="fast-fade">
    <button
      :aria-expanded="false"
      v-if="!isMenuOpen && !isHuge"
      class="h-12 w-12 inline-flex col justify-center items-center transition duration-150 z-11"
      @click="openMenu"
      :aria-label="t('menu.open')"
      :title="t('menu.open')"
      aria-controls="menu"
    >
      <mdi-menu class="h-6 w-6" />
    </button>
  </Transition>
  <div v-if="isHuge" class="h-12 w-12"></div>
  <MenuInner
    :is-menu-open="isMenuOpen && !isHuge"
    :railable="isMedium"
    @close-menu="closeMenu"
  />
  <Scrim :show="isMenuOpen && !isHuge" @dismissed="closeMenu" />
</template>

<style scoped>
.fast-fade-enter-active,
.fast-fade-leave-active {
  transition: all 50ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fast-fade-enter-from,
.fast-fade-leave-to {
  opacity: 0;
}
</style>
