<template>
  <button class="icon-btn text-dark0 dark:text-light0" @click="toggle">
    <i-carbon-menu />
  </button>
  <teleport to="body">
    <transition name="sidebar-anim">
      <nav
        class="
          z-5
          fixed
          top-0
          left-0
          h-screen
          bg-light1
          dark:bg-dark1
          text-dark0
          dark:text-light0
        "
        ref="sidebar"
        v-show="open"
      >
        <span
          class="
            text-xl
            flex flex-row
            items-center
            h-14
            py-2
            px-4
            border-b border-solid border-light0
            dark:border-dark3
          "
        >
          <button class="icon-btn mr-4" @click="toggle">
            <i-carbon-menu />
          </button>
          <Logo />
        </span>
      </nav>
    </transition>
    <transition name="overlay-anim">
      <div
        aria-hidden
        v-show="open"
        class="
          sidebar-overlay
          z-3
          h-screen
          w-screen
          fixed
          top-0
          left-0
          right-0
          bottom-0
        "
      />
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { get, onClickOutside, set, useToggle } from '@vueuse/core'
import { ref } from 'vue'

const sidebar = ref(null)
const open = ref(false)

// If we click outside the sidebar while it's open, close the sidebar.
onClickOutside(sidebar, (e) => (get(open) ? set(open, false) : undefined))

const toggle = useToggle(open)
</script>

<style scoped>
nav {
  width: 16rem;
  box-shadow: 3px 0 5px var(--shadow);
}
.dark nav {
  box-shadow: 3px 0 5px var(--shadow);
}
.sidebar-overlay {
  background-color: var(--shadow);
}
@media (prefers-reduced-motion: no-preference) {
  .overlay-anim-enter-active,
  .overlay-anim-leave-active {
    transition: opacity 0.15s ease-in-out;
  }
  .overlay-anim-enter-from,
  .overlay-anim-leave-to {
    opacity: 0;
  }
  .sidebar-anim-enter-active,
  .sidebar-anim-leave-active {
    transition: transform 0.15s ease-in-out;
  }
  .sidebar-anim-enter-from,
  .sidebar-anim-leave-to {
    transform: translateX(-100%);
  }
}
</style>
