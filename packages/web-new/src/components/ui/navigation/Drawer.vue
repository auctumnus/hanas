<script setup lang="ts">
import { HNavigationDrawer, HIconButton } from 'halcyon-vue'
import { ref } from 'vue'
import NavigationInner from './NavigationInner.vue'
import NavigationExtra from './NavigationExtra.vue'

const open = ref(false)
</script>

<template>
  <h-icon-button label="Open menu" @click="open = true">
    <mdi-menu />
  </h-icon-button>
  <h-navigation-drawer v-model:open="open">
    <navigation-inner />

    <navigation-extra />
  </h-navigation-drawer>
</template>
