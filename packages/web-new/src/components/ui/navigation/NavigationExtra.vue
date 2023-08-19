<script setup lang="ts">
import SettingsButton from './SettingsButton.vue'
import ProfileButton from './ProfileButton.vue'
import { isLoggedIn } from '@/user'
import { inject } from 'vue'

const inDrawer = inject('in drawer', false)
</script>

<template>
  <div class="end" :class="{ 'in-drawer': inDrawer }">
    <settings-button />
    <profile-button v-if="isLoggedIn" />
  </div>
</template>

<style scoped lang="scss">
.end {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.in-drawer {
  margin-bottom: 4px;
}
</style>
