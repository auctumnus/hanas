<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style scoped>
.fade-enter-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
