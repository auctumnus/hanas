<script setup lang="ts">
import { HNavigationButton } from 'halcyon-vue'
import { inject } from 'vue'
import ProfilePicture from '@/components/ProfilePicture.vue'

const inDrawer = inject('in drawer', false)
</script>

<template>
  <h-navigation-button
    label="Profile"
    use-router-link
    :hide-label="!inDrawer"
    to="/"
    :is-active="$route.path === '/profile'"
  >
    <template #active>
      <profile-picture />
    </template>
    <template #inactive>
      <profile-picture />
    </template>
  </h-navigation-button>
</template>
