<template>
    <Transition name="appear" appear>
        <slot />
    </Transition>
</template>

<style scoped>
.appear-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.appear-enter-from {
  opacity: 0;
}
</style>