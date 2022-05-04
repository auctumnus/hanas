<script setup lang="ts">
import { isMedium, isLarge } from '~/composables/device-size'

const root = document.querySelector(':root')!
const setRoot = (
  value: string // @ts-ignore
) => root.style.setProperty('--scrolling', value)
const menuClosed = () => {
  setRoot('auto')
}
const menuOpened = () => {
  setRoot('hidden')
}
</script>

<template>
  <Header @menu-closed="menuClosed" @menu-opened="menuOpened" />
  <router-view
    class="view px-4 mt-16 rounded-tl-lg"
    :class="{ 'ml-20': isMedium, 'ml-3/12': isLarge }"
  />
  <Footer />
</template>

<style>
html,
body,
#app {
  overflow-y: var(--scrolling) !important;
}
.view {
  transition: margin-left var(--material-timing);
  min-height: calc(100vh - 4rem);
}
</style>
