<script setup lang="ts">
import { HNavigationRail, HNavigationBar, HTopAppBar } from 'halcyon-vue'
import NavigationInner from './navigation/NavigationInner.vue'
import NavigationExtra from './navigation/NavigationExtra.vue'
import Drawer from './navigation/Drawer.vue'
import { isCompact } from '@/size'
</script>

<template>
  <template v-if="isCompact">
    <h-top-app-bar hide-on-scroll kind="center" :title="$route.meta.title || 'Hanas'">
      <template #navigation-icon>
        <drawer />
      </template>
    </h-top-app-bar>
    <h-navigation-bar hide-on-scroll style="background-color: var(--halcyon-surface-container)">
      <navigation-inner />
    </h-navigation-bar>
  </template>
  <h-navigation-rail has-drawer v-else>
    <template #drawer>
      <navigation-inner />
      <navigation-extra />
    </template>
    <template #content>
      <navigation-inner />
      <navigation-extra />
    </template>
  </h-navigation-rail>
</template>
