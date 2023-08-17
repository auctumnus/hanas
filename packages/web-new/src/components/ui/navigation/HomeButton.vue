<script setup lang="ts">
import { HNavigationButton } from 'halcyon-vue'
import { inject } from 'vue'

const inDrawer = inject('in drawer', false)
</script>

<template>
  <h-navigation-button
    label="Home"
    use-router-link
    :hide-label="!inDrawer"
    to="/"
    :is-active="$route.path === '/'"
  >
    <template #active>
      <mdi-home />
    </template>
    <template #inactive>
      <mdi-home-outline />
    </template>
  </h-navigation-button>
</template>
