<script setup lang="ts">
import { HNavigationButton } from 'halcyon-vue'

import { inject } from 'vue'

const inDrawer = inject('in drawer', false)
</script>

<template>
  <h-navigation-button
    label="Languages"
    use-router-link
    :hide-label="!inDrawer"
    to="/lang"
    :is-active="$route.path.startsWith('/lang')"
  >
    <template #active>
      <mdi-chat />
    </template>
    <template #inactive>
      <mdi-chat-outline />
    </template>
  </h-navigation-button>
</template>
