<script setup lang="ts">
import { HNavigationButton } from 'halcyon-vue'
import { inject } from 'vue'

const inDrawer = inject('in drawer', false)
</script>

<template>
  <h-navigation-button
    label="Settings"
    use-router-link
    :hide-label="!inDrawer"
    to="/settings"
    :is-active="$route.path === '/settings'"
  >
    <template #active>
      <mdi-cog />
    </template>
    <template #inactive>
      <mdi-cog-outline />
    </template>
  </h-navigation-button>
</template>
