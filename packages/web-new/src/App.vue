<script setup lang="ts">
import Navigation from './components/ui/Navigation.vue'
import { isCompact } from '@/size'
import { computed } from 'vue'
import { useRoute } from 'vue-router';
import { useHead } from '@unhead/vue'

const mainMargin = computed(() => (isCompact.value ? '8px' : '88px'))

const route = useRoute()

useHead({
  title: computed(() => {
    const title = route.meta.title
    return title ? `${title} | Hanas` : 'Hanas'
  })
})
</script>

<template>
  <navigation />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
main {
  padding-left: v-bind(mainMargin);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
