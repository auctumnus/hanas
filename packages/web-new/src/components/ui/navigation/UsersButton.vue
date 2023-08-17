<script setup lang="ts">
import { HNavigationButton } from 'halcyon-vue'
import { inject } from 'vue'

const inDrawer = inject('in drawer', false)
</script>

<template>
  <h-navigation-button
    label="Users"
    use-router-link
    :hide-label="!inDrawer"
    to="/user"
    :is-active="$route.path.startsWith('/user')"
  >
    <template #active>
      <mdi-account />
    </template>
    <template #inactive>
      <mdi-account-outline />
    </template>
  </h-navigation-button>
</template>
