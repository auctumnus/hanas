<script setup lang="ts">
import { Menu, MenuButton, MenuItems } from '@headlessui/vue'
</script>

<template>
  <Menu as="div" class="relative">
    <MenuButton>
      <slot name="menu-button" />
    </MenuButton>
    <Transition name="popup-menu">
      <MenuItems class="absolute top-10 shadow-lg min-w-56">
        <slot name="content" />
      </MenuItems>
    </Transition>
  </Menu>
</template>

<style scoped>
.popup-menu-enter-active,
.popup-menu-leave-active {
  @apply transition-all duration-150;
}

.popup-enter-from,
.popup-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
