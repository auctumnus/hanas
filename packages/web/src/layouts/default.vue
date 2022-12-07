<script setup lang="ts">
import { isSmall, isMedium, isLarge, isHuge } from '~/composables/device-size'

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
    class="view mt-16 rounded-tl-lg flex flex-col max-w-990px"
    :class="{
      'items-center mx-4': isSmall,
      'ml-20 px-4 mx-9': isMedium,
      'ml-3/12': isLarge && !isHuge,
      'ml-2/12': isHuge,
    }"
  />
  <Footer />
</template>

<style>
html,
body,
#app {
  overflow-y: var(--scrolling) !important;
  /* display: flex;
  flex-direction: column;
  align-items: center; */
}
.view {
  transition: margin-left var(--material-timing);
  min-height: calc(100vh - 4rem);
  flex: 1;
}
</style>
