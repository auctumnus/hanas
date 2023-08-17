<script setup lang="ts">
import { HNavigationButton } from 'halcyon-vue'
import { inject } from 'vue'

const showBadge = true
const badgeCount = 3

const inDrawer = inject('in drawer', false)
</script>

<template>
  <h-navigation-button
    label="Invites"
    use-router-link
    :hide-label="!inDrawer"
    to="/invite"
    :is-active="$route.path.startsWith('/invite')"
    :show-badge="showBadge"
    :badge-count="badgeCount"
  >
    <template #active>
      <mdi-mailbox />
    </template>
    <template #inactive>
      <mdi-mailbox-outline />
    </template>
  </h-navigation-button>
</template>
